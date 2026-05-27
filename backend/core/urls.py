# core/urls.py — root URL configuration
# All routes prefixed with /api/

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    """Simple health check endpoint for Docker"""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Health check
    path('health/', health_check),

    # All API routes
    path('api/', include('users.urls')),
    path('api/', include('books.urls')),
    path('api/', include('borrowing.urls')),
    path('api/', include('fines.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)