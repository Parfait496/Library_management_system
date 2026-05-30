# fines/urls.py — API routes only

from django.urls import path
from . import views

urlpatterns = [
    # List all fines (filtered by role automatically)
    path('fines/', views.FineListAPIView.as_view(),
         name='api_fines_list'),

    # Get single fine
    path('fines/<int:pk>/', views.FineDetailAPIView.as_view(),
         name='api_fines_detail'),

    # Resolve a fine — mark paid or waive
    path('fines/<int:pk>/resolve/', views.ResolveFineAPIView.as_view(),
         name='api_resolve_fine'),

    # Summary for member dashboard
    path('fines/summary/', views.MyFinesSummaryAPIView.as_view(),
         name='api_fines_summary'),
]