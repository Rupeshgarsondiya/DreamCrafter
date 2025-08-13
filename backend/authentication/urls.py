from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    user_logout,
    user_profile,
    update_profile
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('login/', UserLoginView.as_view(), name='user_login'),
    path('logout/', user_logout, name='user_logout'),
    path('profile/', user_profile, name='user_profile'),
    path('profile/update/', update_profile, name='update_profile'),
]
