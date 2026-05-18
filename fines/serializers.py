from rest_framework import serializers
from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    """
    Serializer for Fine model.
    Used in API responses.
    """

    # Show member username instead of just ID
    member_username = serializers.CharField(
        source='member.username',
        read_only=True
    )

    # Show book title from the related borrow record
    book_title = serializers.CharField(
        source='borrow_record.book.title',
        read_only=True
    )

    # Computed properties
    is_paid = serializers.SerializerMethodField()
    is_resolved = serializers.SerializerMethodField()

    class Meta:
        model = Fine
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
        # All fields are managed by the system
        read_only_fields = (
            'member', 'amount', 'days_overdue',
            'issued_date', 'resolved_date', 'resolved_by'
        )

    def get_is_paid(self, obj):
        return obj.is_paid

    def get_is_resolved(self, obj):
        return obj.is_resolved