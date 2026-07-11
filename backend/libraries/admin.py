from django.contrib import admin
from .models import Library


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'slug', 'join_code',
        'is_active', 'created_at'
    )
    list_filter  = ('is_active',)
    search_fields = ('name', 'slug', 'join_code')
    readonly_fields = ('join_code', 'created_at')
    prepopulated_fields = {'slug': ('name',)}