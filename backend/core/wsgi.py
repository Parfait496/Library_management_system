import os
import sys

print("=== WSGI Starting ===", flush=True)
print(f"Python: {sys.version}", flush=True)
print(f"Django settings: {os.environ.get('DJANGO_SETTINGS_MODULE', 'not set')}", flush=True)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

try:
    application = get_wsgi_application()
    print("=== WSGI Started Successfully ===", flush=True)
except Exception as e:
    print(f"=== WSGI FAILED: {e} ===", flush=True)
    raise