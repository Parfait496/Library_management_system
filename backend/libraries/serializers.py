from rest_framework import serializers
from .models import Library


class LibrarySerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    book_count   = serializers.SerializerMethodField()

    class Meta:
        model  = Library
        fields = (
            'id', 'slug', 'name', 'description',
            'email', 'phone', 'address', 'website',
            'logo', 'join_code', 'is_active',
            'member_count', 'book_count', 'created_at',
        )
        read_only_fields = ('join_code', 'created_at')

    def get_member_count(self, obj):
        return obj.members.filter(role='MEMBER').count()

    def get_book_count(self, obj):
        return obj.books.count()


class LibraryPublicSerializer(serializers.ModelSerializer):
    """Public info — no join code exposed"""
    class Meta:
        model  = Library
        fields = ('id', 'slug', 'name', 'description', 'logo')