from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from core.export_views import DatabaseSnapshotExportAPIView
from core.backup_views import BackupListCreateAPIView, BackupDownloadAPIView
from core.history_views import ActivityLogAPIView, ActivityLogExportAPIView


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
    path('api/export/snapshot/', DatabaseSnapshotExportAPIView.as_view(), name='api_export_snapshot'),
    path('api/backups/', BackupListCreateAPIView.as_view(), name='api_backups'),
    path('api/backups/<str:filename>/download/', BackupDownloadAPIView.as_view(), name='api_backup_download'),
    path('api/activity-log/', ActivityLogAPIView.as_view(), name='api_activity_log'),
    path('api/export/activity-log/', ActivityLogExportAPIView.as_view(), name='api_export_activity_log'),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)