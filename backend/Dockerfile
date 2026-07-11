FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=core.settings

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip --quiet \
    && pip install -r requirements.txt --quiet

COPY . .

RUN mkdir -p /app/staticfiles /app/media

EXPOSE 10000

CMD ["sh", "-c", "\
    echo '== Collecting static files ==' && \
    python manage.py collectstatic --noinput --clear && \
    echo '== Running migrations ==' && \
    python manage.py migrate --noinput && \
    echo '== Creating superuser ==' && \
    python manage.py create_superuser && \
    echo '== Starting server on port ${PORT:-10000} ==' && \
    exec gunicorn core.wsgi:application \
        --bind 0.0.0.0:${PORT:-10000} \
        --workers 1 \
        --timeout 120 \
        --log-level info \
        --access-logfile - \
        --error-logfile - \
    "]