from django.contrib import admin
from .models import BorrowRecord


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
   
    list_display = (
        'member', 'book', 'status',
        'request_date', 'due_date',
        'is_overdue', 'fine_amount'
    )


    list_filter = ('status', 'request_date', 'due_date')

   
    search_fields = (
        'member__username',
        'book__title',
        'book__author'
    )


    list_editable = ('status',)


    readonly_fields = ('is_overdue', 'days_overdue', 'fine_amount')