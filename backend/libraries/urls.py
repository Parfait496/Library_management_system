from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('libraries/',              views.LibraryListAPIView.as_view(),   name='api_libraries'),
    path('libraries/<slug:slug>/',  views.LibraryDetailAPIView.as_view(), name='api_library_detail'),

    # Auth required
    path('libraries/join/',         views.JoinLibraryAPIView.as_view(),   name='api_join_library'),
    path('libraries/my-library/',   views.MyLibraryAPIView.as_view(),     name='api_my_library'),

    # Admin only
    path('libraries/admin/',        views.LibraryAdminAPIView.as_view(),  name='api_libraries_admin'),
]