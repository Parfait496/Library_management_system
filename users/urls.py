from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from . import views

urlpatterns = [
    path(
        'api/users/token/', 
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/users/token/refresh/', 
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path(
        'api/users/register/',
        views.RegisterAPIView.as_view(),
        name='api_register'
    ),

    path(
        'api/users/profile/',
        views.ProfileAPIView.as_view(),
        name='api_profile'
    ),

    path(
        'api/users/change-password/',
        views.ChangePasswordAPIView.as_view(),
        name='api_change_password'
    ),

    path(
        'api/users/logout/',
        views.LogoutAPIView.as_view(),
        name='api_logout'
    )
]