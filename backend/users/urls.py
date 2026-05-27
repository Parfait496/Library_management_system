# users/urls.py — API routes only, no template URLs

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [

    # ------------------------------------------------------------------
    # JWT AUTH
    # ------------------------------------------------------------------
    path('auth/login/',    TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),
    path('auth/register/', views.RegisterAPIView.as_view(),  name='api_register'),
    path('auth/logout/',   views.LogoutAPIView.as_view(),    name='api_logout'),

    # ------------------------------------------------------------------
    # USER PROFILE
    # ------------------------------------------------------------------
    path('users/profile/',         views.ProfileAPIView.as_view(),        name='api_profile'),
    path('users/change-password/', views.ChangePasswordAPIView.as_view(), name='api_change_password'),

    # ------------------------------------------------------------------
    # MEMBERS MANAGEMENT — librarians and admins only
    # ------------------------------------------------------------------
    path('users/members/',         views.MembersListAPIView.as_view(),   name='api_members_list'),
    path('users/members/<int:pk>/', views.MemberDetailAPIView.as_view(), name='api_member_detail'),


    path('auth/verify-email/',        views.VerifyEmailAPIView.as_view(),        name='api_verify_email'),
    path('auth/resend-verification/', views.ResendVerificationAPIView.as_view(), name='api_resend_verification'),


    path('auth/forgot-password/', views.ForgotPasswordAPIView.as_view(), name='api_forgot_password'),
    path('auth/reset-password/',  views.ResetPasswordAPIView.as_view(), name='api_reset_password'),
]