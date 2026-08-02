import os
import io
from datetime import datetime
from django.conf import settings
from django.http import FileResponse, Http404
from django.core.management import call_command
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

# Uses Django's built-in "dumpdata" — a pure-Python export, so it
# works on any host without needing the pg_dump binary installed.
# Restorable with: python manage.py loaddata <filename>
BACKUP_APPS = ['users', 'books', 'borrowing', 'fines']
BACKUP_DIR = os.path.join(settings.MEDIA_ROOT, 'backups')


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class BackupListCreateAPIView(APIView):
    """
    GET  /api/backups/  — list existing backups (newest first)
    POST /api/backups/  — create a new backup right now
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        files = []
        for name in os.listdir(BACKUP_DIR):
            if not name.endswith('.json'):
                continue
            path = os.path.join(BACKUP_DIR, name)
            stat = os.stat(path)
            files.append({
                'filename': name,
                'size_kb': round(stat.st_size / 1024, 1),
                'created_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
        files.sort(key=lambda f: f['created_at'], reverse=True)
        return Response(files)

    def post(self, request):
        os.makedirs(BACKUP_DIR, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'backup_{timestamp}.json'
        filepath = os.path.join(BACKUP_DIR, filename)

        buffer = io.StringIO()
        call_command('dumpdata', *BACKUP_APPS, indent=2, stdout=buffer)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(buffer.getvalue())

        size_kb = round(os.path.getsize(filepath) / 1024, 1)
        return Response({
            'filename': filename,
            'size_kb': size_kb,
            'created_at': datetime.now().isoformat(),
        }, status=status.HTTP_201_CREATED)


class BackupDownloadAPIView(APIView):
    """GET /api/backups/<filename>/download/"""
    permission_classes = [IsAdminUser]

    def get(self, request, filename):
        # Only allow exact filenames from our own backups directory —
        # blocks path traversal attempts entirely.
        if not filename.endswith('.json') or '/' in filename or '..' in filename:
            raise Http404
        filepath = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(filepath):
            raise Http404
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename=filename)