from django.contrib import admin
from .models import Fine


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    # Columns in the list view
    list_display = (
        'member', 'amount', 'days_overdue',
        'status', 'issued_date', 'resolved_date'
    )

    # Filter sidebar
    list_filter = ('status', 'issued_date')

    # Search bar
    search_fields = (
        'member__username',
        'borrow_record__book__title'
    )

    # Make status editable directly in list
    list_editable = ('status',)

    # These are set automatically
    readonly_fields = ('issued_date', 'resolved_date', 'resolved_by')