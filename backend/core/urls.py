from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from core.fine_config import get_fine_summary

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'system': 'ASOME Library Management System'
    })

def fine_config_view(request):
    from django.http import JsonResponse
    return JsonResponse(get_fine_summary())

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check),
    path('api/', include('users.urls')),
    path('api/', include('books.urls')),
    path('api/', include('borrowing.urls')),
    path('api/', include('fines.urls')),
    path('api/config/fines/', fine_config_view, name='fine_config'),
]  

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)