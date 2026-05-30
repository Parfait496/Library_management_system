from pathlib import Path
from decouple import config
import dj_database_url
from datetime import timedelta
import os


BASE_DIR = Path(__file__).resolve().parent.parent

# ===========================================================================
# SECURITY
# ===========================================================================
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this')
# DEBUG      = config('DEBUG', default=False, cast=bool)
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.librarymanagementsystem-production-7ecf.up.railway.app',
    '.libraryms-780009.netlify.app',
    'healthcheck.railway.app',
]

CSRF_TRUSTED_ORIGINS = [
    "https://librarymanagementsystem-production-7ecf.up.railway.app",
    "https://libraryms-780009.netlify.app",
]

# Add any extra hosts from env
EXTRA_HOSTS = config('ALLOWED_HOSTS', default='')
if EXTRA_HOSTS:
    ALLOWED_HOSTS += EXTRA_HOSTS.split(',')

# ===========================================================================
# APPLICATIONS
# ===========================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'users',
    'books',
    'borrowing',
    'fines',
]

# ===========================================================================
# MIDDLEWARE
# ===========================================================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF     = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ===========================================================================
# DATABASE
# ===========================================================================
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     config('DB_NAME',     default='library_db'),
            'USER':     config('DB_USER',     default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST':     config('DB_HOST',     default='db'),
            'PORT':     config('DB_PORT',     default='5432'),
        }
    }

# ===========================================================================
# AUTH
# ===========================================================================
AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===========================================================================
# REST FRAMEWORK
# ===========================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,
    'AUTH_HEADER_TYPES':      ('Bearer',),
}

# ===========================================================================
# CORS
# ===========================================================================
CORS_ALLOW_ALL_ORIGINS   = True
CORS_ALLOW_CREDENTIALS   = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE', 'GET', 'OPTIONS',
    'PATCH', 'POST', 'PUT',
]

# ===========================================================================
# EMAIL
# ===========================================================================
EMAIL_BACKEND       = config('EMAIL_BACKEND',       default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST          = config('EMAIL_HOST',          default='smtp.gmail.com')
EMAIL_PORT          = config('EMAIL_PORT',          default=587, cast=int)
EMAIL_USE_TLS       = config('EMAIL_USE_TLS',       default=True, cast=bool)
EMAIL_HOST_USER     = config('EMAIL_HOST_USER',     default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL  = config('DEFAULT_FROM_EMAIL',  default='LibraryMS <noreply@library.com>')
FRONTEND_URL        = config('FRONTEND_URL',        default='http://localhost:3000')

# ===========================================================================
# INTERNATIONALIZATION
# ===========================================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Kigali'
USE_I18N      = True
USE_TZ        = True

# ===========================================================================
# STATIC FILES
# ===========================================================================
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = []

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Use ManifestStaticFilesStorage with whitenoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

import os
os.makedirs(str(MEDIA_ROOT), exist_ok=True)
os.makedirs(str(BASE_DIR / 'staticfiles'), exist_ok=True)


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



