from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'system': 'ASOME Library Management System'
    })

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