from django.urls import path
from . import views

app_name = 'dream_decoding'

urlpatterns = [
    # Main endpoint for React app
    path('upload-process/', views.upload_and_process_eeg, name='upload_process_eeg'),
    
    # Individual endpoints
    path('predictions/', views.get_user_predictions, name='user_predictions'),
    path('predictions/<uuid:prediction_id>/', views.get_prediction_status, name='prediction_status'),
    path('predictions/<uuid:prediction_id>/delete/', views.delete_prediction, name='delete_prediction'),
    path('predictions/<uuid:prediction_id>/images/', views.list_dream_images, name='list_dream_images'),
    path('predictions/<uuid:prediction_id>/images/generate/', views.generate_dream_image, name='generate_dream_image'),
    # Recommendations
    path('recommendations/', views.get_user_recommendations, name='user_recommendations'),
    
    # User profile
    path('profile/', views.get_user_profile, name='user_profile'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
]
