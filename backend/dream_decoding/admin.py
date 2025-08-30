from django.contrib import admin
from .models import EEGPrediction, DreamImage, UserDreamProfile

@admin.register(EEGPrediction)
class EEGPredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "original_filename", "processing_status", "created_at")
    list_filter = ("processing_status", "created_at")
    search_fields = ("original_filename", "user__username", "id")

@admin.register(DreamImage)
class DreamImageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "prediction", "model_used", "status", "created_at")
    list_filter = ("model_used", "status", "created_at")
    search_fields = ("user__username", "prediction__id", "id")

@admin.register(UserDreamProfile)
class UserDreamProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "preferred_model_version", "successful_analyses", "created_at")
