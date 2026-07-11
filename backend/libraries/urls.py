from django.urls import path
from . import views

urlpatterns = [
    path('libraries/',
         views.LibraryListAPIView.as_view(),
         name='api_libraries'),

    path('libraries/join/',
         views.JoinLibraryAPIView.as_view(),
         name='api_join_library'),

    path('libraries/my-library/',
         views.MyLibraryAPIView.as_view(),
         name='api_my_library'),

    path('libraries/admin/',
         views.LibraryAdminAPIView.as_view(),
         name='api_libraries_admin'),

    path('libraries/admin/<int:pk>/',
         views.LibraryAdminDetailAPIView.as_view(),
         name='api_library_admin_detail'),

    path('libraries/<slug:slug>/',
         views.LibraryDetailAPIView.as_view(),
         name='api_library_detail'),
]