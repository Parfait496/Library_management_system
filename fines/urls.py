from django.urls import path
from . import views

urlpatterns = [

    # -------------------------------------------------------------------
    # API ENDPOINTS (return JSON)
    # -------------------------------------------------------------------
    path('api/fines/', views.FineListAPIView.as_view(), name='api_fines_list'),
    path('api/fines/<int:pk>/', views.FineDetailAPIView.as_view(), name='api_fines_detail'),

    # -------------------------------------------------------------------
    # TEMPLATE URLs (return HTML)
    # -------------------------------------------------------------------

    # Librarians see all fines / Members see their own
    path('fines/', views.fines_list_view, name='fines_list'),

    # Librarian resolves a fine (mark paid or waive)
    path('fines/<int:pk>/resolve/', views.resolve_fine_view, name='resolve_fine'),

    # Member views their own fines
    path('fines/my-fines/', views.my_fines_view, name='my_fines'),
]