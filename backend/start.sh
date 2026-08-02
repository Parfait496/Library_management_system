#!/bin/bash
# start.sh — runs automatically on every Railway deploy.
# No shell access needed: Railway just executes this file as the
# "Start Command" you set in the dashboard.
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files (admin CSS/JS)..."
python manage.py collectstatic --noinput

echo "Ensuring superuser exists..."
python manage.py create_superuser

echo "Starting server..."
gunicorn core.wsgi --bind 0.0.0.0:$PORT