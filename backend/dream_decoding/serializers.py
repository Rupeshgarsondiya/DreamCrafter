from rest_framework import serializers
from .models import EEGPrediction, UserDreamProfile, DreamImage

class EEGPredictionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    processing_time_display = serializers.CharField(read_only=True)
    # latest_image_url removed per request
    
    class Meta:
        model = EEGPrediction
        fields = [
            'id', 'username', 'original_filename', 'file_size',
            'dream_description', 'confidence_score', 'processing_status',
            'detected_sleep_stage', 'num_windows_processed', 'num_dream_segments',
            'model_version', 'created_at', 'updated_at', 'processing_time',
            'processing_time_display', 'error_message', 'analysis_metadata'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserDreamProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    success_rate = serializers.SerializerMethodField()  # FIXED: Use method field
    
    class Meta:
        model = UserDreamProfile
        fields = [
            'username', 'email', 'preferred_model_version', 'notification_enabled',
            'auto_process_uploads', 'total_uploads', 'successful_analyses',
            'success_rate', 'total_processing_time', 'favorite_dream_themes',
            'dream_journal_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'username', 'email', 'total_uploads', 'successful_analyses',
            'success_rate', 'total_processing_time', 'created_at', 'updated_at'
        ]
    
    def get_success_rate(self, obj):
        """Ensure success_rate is always a float number"""
        try:
            if obj.total_uploads == 0:
                return 0.0
            return float((obj.successful_analyses / obj.total_uploads) * 100)
        except (ValueError, TypeError, AttributeError, ZeroDivisionError):
            return 0.0

# DreamImageSerializer removed per request
class DreamImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = DreamImage
        fields = ['id', 'prediction', 'model_used', 'status', 'image', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        try:
            request = self.context.get('request')
            url = obj.image.url if obj.image else None
            if url and request is not None:
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return None
