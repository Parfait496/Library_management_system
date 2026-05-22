from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),

    # Redirect homepage to login page
    path('', lambda request: redirect('login'), name='home'),

    path('', include('users.urls')),
    path('', include('books.urls')),
    path('', include('borrowing.urls')),
    path('', include('fines.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)