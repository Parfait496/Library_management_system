from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'role', 'library', 'is_active')
    list_filter   = ('role', 'library', 'is_active')
    search_fields = ('username', 'email')

    fieldsets = UserAdmin.fieldsets + (
        ('Library Info', {
            'fields': (
                'role', 'library', 'phone_number',
                'address', 'date_of_birth',
                'profile_picture', 'is_verified',
                'email_verified', 'email_verification_token',
            )
        }),
    )