from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    """Health check endpoint for Railway"""
    return JsonResponse({'status': 'ok', 'service': 'library-api'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check),
    path('api/', include('users.urls')),
    path('api/', include('books.urls')),
    path('api/', include('borrowing.urls')),
    path('api/', include('fines.urls')),
]  

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)