from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db import transaction
import os
import logging
from datetime import timedelta, datetime
import threading
import asyncio
import math

import numpy as np

try:
	import torch  # type: ignore
except Exception:  # pragma: no cover
	torch = None

from .models import EEGPrediction, UserDreamProfile, DreamImage
from .serializers import EEGPredictionSerializer, UserDreamProfileSerializer, DreamImageSerializer
from .ml_models.inference_wrapper import get_inference_engine
from .services.image_provider import get_image_provider

logger = logging.getLogger(__name__)


def _make_json_safe(value):
	"""Recursively convert values to JSON-serializable and JSON-valid types.
	- Converts numpy arrays/values and torch tensors to Python lists/numbers
	- Converts tuples/sets to lists
	- Replaces NaN/Inf with None
	"""
	# Handle None and primitives
	if value is None:
		return None
	if isinstance(value, (str, int, bool)):
		return value
	if isinstance(value, float):
		return value if math.isfinite(value) else None
	# Numpy scalars
	if isinstance(value, np.generic):
		py_val = value.item()
		return _make_json_safe(py_val)
	# Numpy arrays
	if isinstance(value, np.ndarray):
		return _make_json_safe(value.tolist())
	# Torch tensors
	if torch is not None and isinstance(value, torch.Tensor):  # type: ignore
		return _make_json_safe(value.detach().cpu().tolist())
	# Mappings
	if isinstance(value, dict):
		return {str(k): _make_json_safe(v) for k, v in value.items()}
	# Iterables
	if isinstance(value, (list, tuple, set)):
		return [_make_json_safe(v) for v in value]
	# Fallback: try to stringify unknown objects
	try:
		return str(value)
	except Exception:
		return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_and_process_eeg(request):
	"""
	Single endpoint for uploading EEG file and processing it
	This is the main endpoint your React app will call
	"""
	try:
		# Validate file upload
		if 'eeg_file' not in request.FILES:
			return Response({
				'success': False,
				'error': 'No EEG file provided. Please upload an .edf file.'
			}, status=status.HTTP_400_BAD_REQUEST)
		
		eeg_file = request.FILES['eeg_file']
		
		# File validation
		validation_result = _validate_eeg_file(eeg_file)
		if not validation_result['valid']:
			return Response({
				'success': False,
				'error': validation_result['error']
			}, status=status.HTTP_400_BAD_REQUEST)
		
		# Create prediction record with transaction
		with transaction.atomic():
			prediction = EEGPrediction.objects.create(
				user=request.user,
				original_filename=eeg_file.name,
				eeg_file=eeg_file,
				file_size=eeg_file.size,
				processing_status='uploaded',
				processing_started_at=timezone.now(),
				eeg_metadata={
					'original_name': eeg_file.name,
					'content_type': eeg_file.content_type,
					'upload_timestamp': timezone.now().isoformat(),
				}
			)
			
			# Update user profile
			profile, created = UserDreamProfile.objects.get_or_create(user=request.user)
			profile.total_uploads += 1
			profile.save()
		
		logger.info(f"EEG file uploaded by {request.user.username}: {eeg_file.name}")
		
		# Process the file immediately
		processing_result = _process_prediction_sync(prediction)
		
		if processing_result['success']:
			return Response({
				'success': True,
				'dream_record': {
					'id': str(prediction.id),
					'dream_description': prediction.dream_description,
					'confidence_score': prediction.confidence_score,
					'processing_time_display': prediction.processing_time_display,
					'detected_sleep_stage': prediction.detected_sleep_stage,
					'num_windows_processed': prediction.num_windows_processed,
					'num_dream_segments': prediction.num_dream_segments,
					'model_version': prediction.model_version,
					'created_at': prediction.created_at.isoformat(),
				},
				'message': 'EEG file processed successfully!'
			}, status=status.HTTP_200_OK)
		else:
			return Response({
				'success': False,
				'error': processing_result['error'],
				'prediction_id': str(prediction.id)
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
			
	except Exception as e:
		logger.error(f"Upload and process failed: {str(e)}")
		return Response({
			'success': False,
			'error': f'Unexpected error: {str(e)}'
		}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _validate_eeg_file(eeg_file):
	"""Comprehensive file validation"""
	try:
		# Check file extension
		if not eeg_file.name.lower().endswith('.edf'):
			return {'valid': False, 'error': 'Only .edf files are supported'}
		
		# Check file size (max 200MB)
		max_size = 200 * 1024 * 1024  # 200MB
		if eeg_file.size > max_size:
			return {'valid': False, 'error': f'File too large. Maximum size: {max_size/1024/1024:.0f}MB'}
		
		# Check minimum file size (1KB)
		if eeg_file.size < 1024:
			return {'valid': False, 'error': 'File too small. Minimum size: 1KB'}
		
		# Check file content type
		allowed_types = ['application/octet-stream', 'application/x-edf']
		if eeg_file.content_type and eeg_file.content_type not in allowed_types:
			logger.warning(f"Unusual content type: {eeg_file.content_type}")
		
		return {'valid': True}
		
	except Exception as e:
		return {'valid': False, 'error': f'File validation error: {str(e)}'}


def _process_prediction_sync(prediction):
	"""Synchronously process the EEG prediction"""
	try:
		# Update status to processing
		prediction.processing_status = 'processing'
		prediction.save()
		
		# Get file path
		file_path = prediction.eeg_file.path
		
		if not os.path.exists(file_path):
			raise FileNotFoundError(f"Uploaded file not found: {file_path}")
		
		# Get inference engine and process
		inference_engine = get_inference_engine()
		result = inference_engine.predict_dream_text(file_path)
		
		# Update prediction with results
		with transaction.atomic():
			prediction.processing_completed_at = timezone.now()
			
			if result['success']:
				prediction.dream_description = result['dream_text']
				prediction.confidence_score = result['confidence']
				prediction.processing_status = 'completed'
				prediction.detected_sleep_stage = result.get('sleep_stage', 2)
				prediction.num_windows_processed = result.get('num_windows_processed', 0)
				prediction.num_dream_segments = result.get('num_dream_segments', 1)
				prediction.model_version = result.get('model_version', 'eeg_text_best_v1')
				
				# Sanitize and store metadata and advanced analysis
				raw_metadata = result.get('metadata', {}) or {}
				safe_metadata = _make_json_safe(raw_metadata)
				if 'advanced_analysis' in result:
					safe_metadata['advanced_analysis'] = _make_json_safe(result['advanced_analysis'])
				prediction.analysis_metadata = safe_metadata
				
				# Update processing time
				if prediction.processing_started_at:
					time_diff = prediction.processing_completed_at - prediction.processing_started_at
					prediction.processing_time = time_diff
				
				# Update user profile
				profile = prediction.user.dream_profile
				profile.successful_analyses += 1
				if profile.total_processing_time:
					profile.total_processing_time += prediction.processing_time
				else:
					profile.total_processing_time = prediction.processing_time
				profile.save()
				
				logger.info(f"Prediction completed for {prediction.user.username}")
				
			else:
				prediction.processing_status = 'failed'
				prediction.error_message = result.get('error_message', 'Unknown error')
				prediction.error_traceback = result.get('error_traceback', '')
				
				logger.error(f"Prediction failed for {prediction.user.username}: {prediction.error_message}")
			
			prediction.save()
		
		return {'success': result['success'], 'error': result.get('error_message')}
		
	except Exception as e:
		# Update prediction status to failed
		try:
			with transaction.atomic():
				prediction.processing_status = 'failed'
				prediction.error_message = str(e)
				prediction.processing_completed_at = timezone.now()
				prediction.save()
		except:
			pass
			
		logger.error(f"Processing failed for prediction {prediction.id}: {str(e)}")
		return {'success': False, 'error': str(e)}

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prediction_status(request, prediction_id):
	"""Get status of a specific prediction"""
	try:
		prediction = get_object_or_404(
			EEGPrediction, 
			id=prediction_id, 
			user=request.user
		)
		
		serializer = EEGPredictionSerializer(prediction, context={'request': request})
		return Response({
			'success': True,
			'prediction': serializer.data
		}, status=status.HTTP_200_OK)
		
	except Exception as e:
		return Response({
			'success': False,
			'error': f'Failed to get prediction status: {str(e)}'
		}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_predictions(request):
	"""Get all predictions for the current user with pagination"""
	try:
		# Get query parameters
		page = int(request.GET.get('page', 1))
		limit = min(int(request.GET.get('limit', 10)), 50)  # Max 50 per page
		status_filter = request.GET.get('status')
		start_date_str = request.GET.get('start_date')
		end_date_str = request.GET.get('end_date')
		
		# Build queryset
		queryset = EEGPrediction.objects.filter(user=request.user)
		
		if status_filter:
			queryset = queryset.filter(processing_status=status_filter)

		# Date filtering rules
		def _parse_date(s):
			try:
				return datetime.strptime(s, '%Y-%m-%d').date()
			except Exception:
				return None

		start_date = _parse_date(start_date_str) if start_date_str else None
		end_date = _parse_date(end_date_str) if end_date_str else None

		if start_date:
			start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
			queryset = queryset.filter(created_at__gte=start_dt)
		# If only start provided, end defaults to today
		if start_date and not end_date:
			end_date = timezone.now().date()
		if end_date:
			end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
			queryset = queryset.filter(created_at__lte=end_dt)
		
		# Get total count
		total_count = queryset.count()
		
		# Apply pagination
		offset = (page - 1) * limit
		predictions = queryset[offset:offset + limit]
		
		# Serialize data
		serializer = EEGPredictionSerializer(predictions, many=True, context={'request': request})
		
		return Response({
			'success': True,
			'predictions': serializer.data,
			'pagination': {
				'page': page,
				'limit': limit,
				'total': total_count,
				'has_more': offset + limit < total_count
			}
		}, status=status.HTTP_200_OK)
		
	except Exception as e:
		return Response({
			'success': False,
			'error': f'Failed to get predictions: {str(e)}'
		}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
	"""Get user dream profile with statistics"""
	try:
		profile, created = UserDreamProfile.objects.get_or_create(user=request.user)
		serializer = UserDreamProfileSerializer(profile)
		
		return Response({
			'success': True,
			'profile': serializer.data
		}, status=status.HTTP_200_OK)
		
	except Exception as e:
		return Response({
			'success': False,
			'error': f'Failed to get profile: {str(e)}'
		}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_prediction(request, prediction_id):
	"""Delete a prediction and its associated file"""
	try:
		prediction = get_object_or_404(
			EEGPrediction,
			id=prediction_id,
			user=request.user
		)
		
		# Delete the file from storage
		if prediction.eeg_file:
			try:
				default_storage.delete(prediction.eeg_file.name)
			except Exception as e:
				logger.warning(f"Could not delete file {prediction.eeg_file.name}: {str(e)}")
		
		# Delete the prediction record
		prediction.delete()
		
		logger.info(f"Prediction {prediction_id} deleted by {request.user.username}")
		
		return Response({
			'success': True,
			'message': 'Prediction deleted successfully'
		}, status=status.HTTP_200_OK)
		
	except Exception as e:
		return Response({
			'success': False,
			'error': f'Failed to delete prediction: {str(e)}'
		}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_check(request):
	"""Health check endpoint for the ML model"""
	try:
		inference_engine = get_inference_engine()
		
		return Response({
			'success': True,
			'status': 'healthy',
			'model_loaded': inference_engine.model_loaded,
			'vocab_loaded': inference_engine.vocab_loaded,
			'device': str(inference_engine.device),
			'timestamp': timezone.now().isoformat()
		}, status=status.HTTP_200_OK)
		
	except Exception as e:
		return Response({
			'success': False,
			'status': 'unhealthy',
			'error': str(e),
			'timestamp': timezone.now().isoformat()
		}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

# --- Frequency-based recommendations ---
FREQUENCY_DESCRIPTIONS = {
    'Delta': 'deep sleep & healing',
    'Theta': 'creativity & meditation',
    'Alpha': 'relaxed & calm',
    'Beta': 'focused & alert',
    'Gamma': 'peak cognitive processing'
}

# Example mapping; extend/replace with DB/JSON as needed
FREQUENCY_MAPPING = [
    {
        'dominant': 'Beta',
        'recommend': 'Alpha',
        'video_url': 'https://www.youtube.com/embed/xxxx',
        'duration_minutes': 12,
        'tip': 'Relax and unwind by listening to Alpha waves for 12 minutes.'
    },
    {
        'dominant': 'Alpha',
        'recommend': 'Theta',
        'video_url': 'https://www.youtube.com/embed/yyyy',
        'duration_minutes': 15,
        'tip': 'Boost creativity and mindfulness with Theta frequencies for 15 minutes.'
    },
    {
        'dominant': 'Theta',
        'recommend': 'Alpha',
        'video_url': 'https://www.youtube.com/embed/AbCdEf',
        'duration_minutes': 10,
        'tip': 'Balance dreamy states with 10 minutes of Alpha for gentle focus.'
    },
    {
        'dominant': 'Delta',
        'recommend': 'Theta',
        'video_url': 'https://www.youtube.com/embed/GhIjKl',
        'duration_minutes': 8,
        'tip': 'Ease into wakefulness with Theta for 8 minutes after deep rest.'
    },
    {
        'dominant': 'Gamma',
        'recommend': 'Alpha',
        'video_url': 'https://www.youtube.com/embed/MnOpQr',
        'duration_minutes': 12,
        'tip': 'Cool down intense focus with 12 minutes of calming Alpha.'
    }
]

def _find_mapping_for(dominant_band: str):
    for m in FREQUENCY_MAPPING:
        if m.get('dominant') == dominant_band:
            return m
    # Default fallback
    return {
        'dominant': dominant_band,
        'recommend': 'Alpha',
        'video_url': 'https://www.youtube.com/embed/xxxx',
        'duration_minutes': 10,
        'tip': 'Take 10 minutes with Alpha waves to restore balance.'
    }

def _extract_dominant_band(analysis_metadata: dict):
    try:
        adv = (analysis_metadata or {}).get('advanced_analysis') or {}
        eeg = adv.get('eeg_analysis') or {}
        freq = eeg.get('frequency_analysis') or {}
        # Expected numeric values
        bands = {
            'Delta': freq.get('delta_band'),
            'Theta': freq.get('theta_band'),
            'Alpha': freq.get('alpha_band'),
            'Beta': freq.get('beta_band'),
            'Gamma': freq.get('gamma_band')
        }
        # Filter out None
        bands = {k: v for k, v in bands.items() if isinstance(v, (int, float))}
        if not bands:
            return None
        # Choose max value
        return max(bands.items(), key=lambda kv: kv[1])[0]
    except Exception:
        return None

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_recommendations(request):
    """Build frequency-based recommendations per session from existing analysis_metadata."""
    try:
        # Pull latest 20 sessions for user
        sessions = EEGPrediction.objects.filter(user=request.user).order_by('-created_at')[:20]
        items = []
        freq_counts = {}
        unique_map = {}
        for p in sessions:
            dominant = _extract_dominant_band(p.analysis_metadata)
            if dominant is None:
                # Skip if no frequency data available
                continue
            mapping = _find_mapping_for(dominant)
            items.append({
                'prediction_id': str(p.id),
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'dominant': dominant,
                'dominant_description': FREQUENCY_DESCRIPTIONS.get(dominant, ''),
                'recommend': mapping.get('recommend'),
                'video_url': mapping.get('video_url'),
                'duration_minutes': mapping.get('duration_minutes'),
                'tip': mapping.get('tip'),
            })
            # Aggregate for summary/unique
            freq_counts[dominant] = freq_counts.get(dominant, 0) + 1
            if dominant not in unique_map:
                unique_map[dominant] = {
                    'dominant': dominant,
                    'dominant_description': FREQUENCY_DESCRIPTIONS.get(dominant, ''),
                    'recommend': mapping.get('recommend'),
                    'duration_minutes': mapping.get('duration_minutes'),
                    'tip': mapping.get('tip'),
                    'count': 1,
                }
            else:
                unique_map[dominant]['count'] += 1

        # Build summary: choose most frequent dominant if present
        summary = None
        if freq_counts:
            top_dom = max(freq_counts.items(), key=lambda kv: kv[1])[0]
            m = unique_map.get(top_dom) or {}
            summary = {
                'dominant': top_dom,
                'dominant_description': FREQUENCY_DESCRIPTIONS.get(top_dom, ''),
                'recommend': m.get('recommend'),
                'duration_minutes': m.get('duration_minutes'),
                'tip': m.get('tip'),
                'sessions_with_dominant': freq_counts[top_dom],
            }

        unique_list = list(unique_map.values())

        return Response({
            'success': True,
            'recommendations': items,
            'unique_recommendations': unique_list,
            'summary': summary,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception('Failed to build recommendations')
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# generate_dream_image removed per request
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_dream_images(request, prediction_id):
    try:
        prediction = get_object_or_404(EEGPrediction, id=prediction_id, user=request.user)
        images = prediction.images.all()
        ser = DreamImageSerializer(images, many=True, context={'request': request})
        return Response({'success': True, 'images': ser.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_dream_image(request, prediction_id):
    try:
        prediction = get_object_or_404(EEGPrediction, id=prediction_id, user=request.user)
        if not prediction.dream_description:
            return Response({'success': False, 'error': 'No dream description available.'}, status=status.HTTP_400_BAD_REQUEST)

        dream_text = prediction.dream_description.strip()
        # Build a vivid prompt using dream text only
        prompt = f"Generate a detailed, surreal artwork based on this dream: '{dream_text}'. Emphasize velvet tones, white & orange glow, mysterious yet positive mood."

        provider = get_image_provider()
        external_url = provider.generate_image(prompt)

        # If provider returns a remote URL, optionally download and store locally to ImageField
        from django.core.files.base import ContentFile
        import requests as rq
        import base64
        image_file = None
        try:
            if external_url.startswith('http'):
                r = rq.get(external_url, timeout=60)
                r.raise_for_status()
                image_file = ContentFile(r.content, name=f"dream_{prediction.id}.png")
            elif external_url.startswith('data:image'):
                # Handle both base64 and utf8 data URLs
                header, payload = external_url.split(',', 1)
                # Determine extension from mime
                ext = 'png'
                if 'image/' in header:
                    mime = header.split('image/', 1)[1].split(';', 1)[0]
                    if mime:
                        ext = 'jpg' if mime == 'jpeg' else mime
                if 'base64' in header:
                    raw = base64.b64decode(payload)
                else:
                    # utf8 raw payload
                    raw = payload.encode('utf-8')
                image_file = ContentFile(raw, name=f"dream_{prediction.id}.{ext}")
        except Exception:
            image_file = None

        from .models import DreamImage
        img = DreamImage.objects.create(
            user=request.user,
            prediction=prediction,
            prompt_text=dream_text,
            model_used=provider.__class__.__name__,
            status='generated',
            image=image_file
        )
        ser = DreamImageSerializer(img, context={'request': request})
        return Response({'success': True, 'image': ser.data, 'external_url': external_url}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception('Image generation failed')
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
