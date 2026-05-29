FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media

# Collect static with dummy keys
RUN SECRET_KEY=dummy-build-key-not-for-production \
    DATABASE_URL=sqlite:////tmp/build.db \
    DEBUG=False \
    python manage.py collectstatic --noinput --clear

EXPOSE 8000

# Start command — migrate then start gunicorn
CMD ["sh", "-c", "\
    echo 'Running migrations...' && \
    python manage.py migrate --noinput && \
    echo 'Creating superuser...' && \
    python manage.py create_superuser && \
    echo 'Starting gunicorn...' && \
    gunicorn core.wsgi:application \
        --bind 0.0.0.0:${PORT:-8000} \
        --workers 1 \
        --timeout 120 \
        --log-level info \
    "]