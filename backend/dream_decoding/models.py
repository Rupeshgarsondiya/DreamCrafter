from django.db import models
from django.conf import settings  # Import settings instead of User
from django.core.validators import FileExtensionValidator
import uuid
import os

def eeg_upload_path(instance, filename):
    """Generate upload path for EEG files"""
    return f'eeg_files/{instance.user.username}/{uuid.uuid4()}/{filename}'

class EEGPrediction(models.Model):
    """Robust model for EEG predictions with comprehensive tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Upload'),
        ('uploaded', 'File Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed Successfully'),
        ('failed', 'Processing Failed'),
    ]
    
    SLEEP_STAGE_CHOICES = [
        (0, 'Wake'),
        (1, 'Light Sleep (N1)'),
        (2, 'Deep Sleep (N2)'),
        (3, 'Deep Sleep (N3)'),
        (4, 'REM Sleep'),
    ]
    
    # Primary identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # CHANGE: Use settings.AUTH_USER_MODEL instead of User
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dream_predictions')
    
    # File information
    original_filename = models.CharField(max_length=255)
    eeg_file = models.FileField(
        upload_to=eeg_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['edf', 'EDF'])],
        help_text="Upload EEG .edf files only"
    )
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    
    # Processing status and results
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    dream_description = models.TextField(blank=True, null=True, help_text="Generated dream text")
    confidence_score = models.FloatField(null=True, blank=True, help_text="Model confidence (0-1)")
    
    # Advanced analysis results
    detected_sleep_stage = models.IntegerField(choices=SLEEP_STAGE_CHOICES, null=True, blank=True)
    num_windows_processed = models.PositiveIntegerField(default=0)
    num_dream_segments = models.PositiveIntegerField(default=0)
    model_version = models.CharField(max_length=50, default='eeg_text_best_v1')
    
    # Timing and error tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_time = models.DurationField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    error_traceback = models.TextField(blank=True, null=True)
    
    # Metadata for analysis
    eeg_metadata = models.JSONField(default=dict, blank=True)
    analysis_metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'dream_predictions'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['processing_status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.original_filename} ({self.processing_status})"
    
    @property
    def processing_time_display(self):
        """Human readable processing time"""
        if self.processing_time:
            seconds = self.processing_time.total_seconds()
            if seconds < 60:
                return f"{seconds:.1f} seconds"
            elif seconds < 3600:
                return f"{seconds/60:.1f} minutes"
            else:
                return f"{seconds/3600:.1f} hours"
        return "N/A"

class UserDreamProfile(models.Model):
    """Extended user profile for dream analysis"""
    
    # CHANGE: Use settings.AUTH_USER_MODEL instead of User
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dream_profile')
    
    # Preferences
    preferred_model_version = models.CharField(max_length=50, default='eeg_text_best')
    notification_enabled = models.BooleanField(default=True)
    auto_process_uploads = models.BooleanField(default=True)
    
    # Statistics
    total_uploads = models.PositiveIntegerField(default=0)
    successful_analyses = models.PositiveIntegerField(default=0)
    total_processing_time = models.DurationField(null=True, blank=True)
    
    # Personalization
    favorite_dream_themes = models.JSONField(default=list, blank=True)
    dream_journal_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_dream_profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Dream Profile"
    
    @property
    def success_rate(self):
        """Calculate success rate percentage"""
        if self.total_uploads == 0:
            return 0.0
        return (self.successful_analyses / self.total_uploads) * 100

# Signal to create profile when user is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_dream_profile(sender, instance, created, **kwargs):
    if created:
        UserDreamProfile.objects.create(user=instance)
