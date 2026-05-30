from django.contrib import admin
from .models import Fine


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = (
        'member', 'book_title', 'amount',
        'days_overdue', 'status', 'issued_date'
    )
    list_filter  = ('status', 'issued_date')
    search_fields = (
        'member__username',
        'borrow_record__book__title'
    )
    readonly_fields = ('issued_date', 'resolved_date')

    def book_title(self, obj):
        try:
            return obj.borrow_record.book.title
        except Exception:
            return 'Unknown'
    book_title.short_description = 'Book'