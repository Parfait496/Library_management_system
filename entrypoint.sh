#!/bin/sh

# entrypoint.sh
# This script runs every time the container starts.
# It handles database setup before starting the server.

echo "========================================"
echo " Library Management System Starting..."
echo "========================================"

# Wait for PostgreSQL to be ready
# Even with healthcheck in docker-compose, we add
# an extra check here to be safe
echo "Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
    echo "PostgreSQL not ready — waiting 2 seconds..."
    sleep 2
done
echo "PostgreSQL is ready!"

# Run database migrations
# This creates/updates all tables based on your models
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files into STATIC_ROOT
# In production, a web server (nginx) serves these
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser automatically if it doesn't exist
# Uses environment variables from .env
echo "Creating superuser if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
username = '${DJANGO_SUPERUSER_USERNAME}'
email = '${DJANGO_SUPERUSER_EMAIL}'
password = '${DJANGO_SUPERUSER_PASSWORD}'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        role='ADMIN'
    )
    print(f'Superuser {username} created successfully.')
else:
    print(f'Superuser {username} already exists.')
"

echo "========================================"
echo " Starting Django development server..."
echo "========================================"

# Start the Django server
# 0.0.0.0 means listen on all network interfaces
# so it is accessible from outside the container
exec python manage.py runserver 0.0.0.0:8000