from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'role', 'is_active')
    list_filter   = ('role', 'is_active')
    search_fields = ('username', 'email')

    fieldsets = UserAdmin.fieldsets + (
        ('Profile Info', {
            'fields': (
                'role', 'phone_number',
                'address', 'date_of_birth',
                'profile_picture',
                'email_verified', 'email_verification_token',
            )
        }),
    )