from rest_framework import serializers
from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    """
    Serializer for Fine model.
    Includes computed fields and related book title.
    """
    member_username = serializers.CharField(
        source='member.username',
        read_only=True
    )
    book_title = serializers.SerializerMethodField()
    is_paid    = serializers.SerializerMethodField()
    is_resolved = serializers.SerializerMethodField()

    class Meta:
        model  = Fine
        fields = (
            'id',
            'borrow_record',
            'member',
            'member_username',
            'book_title',
            'amount',
            'days_overdue',
            'status',
            'issued_date',
            'resolved_date',
            'resolved_by',
            'note',
            'is_paid',
            'is_resolved',
        )
        read_only_fields = (
            'member', 'amount', 'days_overdue',
            'issued_date', 'resolved_date', 'resolved_by',
        )

    def get_book_title(self, obj):
        """Get book title from the related borrow record"""
        try:
            return obj.borrow_record.book.title
        except Exception:
            return 'Unknown'

    def get_is_paid(self, obj):
        return obj.is_paid

    def get_is_resolved(self, obj):
        return obj.is_resolved