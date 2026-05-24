from django.urls import path
from . import views

urlpatterns = [
    path('fines/', views.FineListAPIView.as_view(), name='api_fines_list'),
    path('fines/<int:pk>/', views.FineDetailAPIView.as_view(), name='api_fines_detail'),
    path('fines/<int:pk>/resolve/', views.ResolveFineAPIView.as_view(), name='api_resolve_fine'),
]