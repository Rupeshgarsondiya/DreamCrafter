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
from datetime import timedelta
import threading
import asyncio

from .models import EEGPrediction, UserDreamProfile
from .serializers import EEGPredictionSerializer, UserDreamProfileSerializer
from .ml_models.inference_wrapper import get_inference_engine

logger = logging.getLogger(__name__)

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
                prediction.analysis_metadata = result.get('metadata', {})
                
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
        
        serializer = EEGPredictionSerializer(prediction)
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
        
        # Build queryset
        queryset = EEGPrediction.objects.filter(user=request.user)
        
        if status_filter:
            queryset = queryset.filter(processing_status=status_filter)
        
        # Get total count
        total_count = queryset.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        predictions = queryset[offset:offset + limit]
        
        # Serialize data
        serializer = EEGPredictionSerializer(predictions, many=True)
        
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
