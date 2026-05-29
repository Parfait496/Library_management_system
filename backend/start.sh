#!/bin/bash
set -e

echo "=== Starting Library Management System ==="

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating superuser..."
python manage.py create_superuser

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn core.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 1 \
    --timeout 120 \
    --log-level debug \
    --access-logfile - \
    --error-logfile -