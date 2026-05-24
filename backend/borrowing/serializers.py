from rest_framework import serializers
from .models import BorrowRecord
from books.serializers import BookSerializer
from users.serializers import UserSerializer


class BorrowRecordSerializer(serializers.ModelSerializer):
    


    book_detail = BookSerializer(source='book', read_only=True)
    member_detail = UserSerializer(source='member', read_only=True)

    
    is_overdue = serializers.SerializerMethodField()
    days_overdue = serializers.SerializerMethodField()
    fine_amount = serializers.SerializerMethodField()

    class Meta:
        model = BorrowRecord
        fields = (
            'id',
            'member',           
            'member_detail',    
            'book',             
            'book_detail',      
            'status',
            'request_date',
            'approved_date',
            'borrow_date',
            'due_date',
            'return_date',
            'processed_by',
            'librarian_note',
            'is_overdue',
            'days_overdue',
            'fine_amount',
        )
        
        read_only_fields = (
            'status', 'request_date', 'approved_date',
            'borrow_date', 'due_date', 'return_date',
            'processed_by', 'member'
        )

    def get_is_overdue(self, obj):
        return obj.is_overdue

    def get_days_overdue(self, obj):
        return obj.days_overdue

    def get_fine_amount(self, obj):
        return obj.fine_amount