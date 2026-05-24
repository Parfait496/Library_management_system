from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.RegisterAPIView.as_view(), name='api_register'),
    path('auth/logout/', views.LogoutAPIView.as_view(), name='api_logout'),

    # User
    path('users/profile/', views.ProfileAPIView.as_view(), name='api_profile'),
    path('users/change-password/', views.ChangePasswordAPIView.as_view(), name='api_change_password'),
    path('users/members/', views.MembersListAPIView.as_view(), name='api_members_list'),
    path('users/members/<int:pk>/', views.MemberDetailAPIView.as_view(), name='api_member_detail'),
]