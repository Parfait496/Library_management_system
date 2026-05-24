from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_verified', 'is_active')
    list_filter = ('role', 'is_verified', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Library Info', {
            'fields': ('role', 'phone_number', 'address', 'date_of_birth',
                       'profile_picture', 'is_verified')
        }),

    )

    search_fields = ('username', 'email')
