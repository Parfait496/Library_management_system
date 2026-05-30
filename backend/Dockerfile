FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8080

CMD ["sh", "-c", "\
    echo '== Collecting static files ==' && \
    python manage.py collectstatic --noinput --clear && \
    echo '== Running migrations ==' && \
    python manage.py migrate --noinput && \
    # echo '== Creating superuser ==' && \
    # python manage.py create_superuser && \
    echo '== Starting server ==' && \
    gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --timeout 120 \
    "]