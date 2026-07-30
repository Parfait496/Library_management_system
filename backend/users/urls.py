from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # Auth
    path('auth/login/',         TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/',       TokenRefreshView.as_view(),    name='refresh'),
    path('auth/logout/',        views.LogoutAPIView.as_view(), name='logout'),

    # Profile
    path('users/profile/',      views.ProfileAPIView.as_view(),       name='profile'),
    path('users/change-password/', views.ChangePasswordAPIView.as_view(), name='change_password'),

    # User management (admin + librarian)
    path('users/',              views.UsersListAPIView.as_view(),   name='users_list'),
    path('users/create/',       views.CreateUserAPIView.as_view(),  name='create_user'),
    path('users/<int:pk>/',     views.UserDetailAPIView.as_view(),  name='user_detail'),
]