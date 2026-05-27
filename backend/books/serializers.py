from rest_framework import serializers
from .models import Book, Genre, BookSuggestion


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genre
        fields = ('id', 'name', 'description')


class BookSerializer(serializers.ModelSerializer):
    """
    Serializer for Book model.
    cover_image_url returns full absolute URL for the image.
    """
    is_available        = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()
    genre_name          = serializers.CharField(
        source='genre.name', read_only=True
    )
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model  = Book
        fields = (
            'id', 'isbn', 'title', 'author', 'publisher',
            'publication_year', 'genre', 'genre_name',
            'description', 'total_copies', 'available_copies',
            'cover_image', 'cover_image_url',
            'is_available', 'availability_status', 'created_at',
        )
        read_only_fields = ('available_copies', 'created_at')

    def get_is_available(self, obj):
        return obj.is_available

    def get_availability_status(self, obj):
        return obj.availability_status

    def get_cover_image_url(self, obj):
        """
        Returns the full URL for the cover image.
        Uses request context to build absolute URL.
        Falls back to relative URL if no request in context.
        """
        if not obj.cover_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.cover_image.url)
        return obj.cover_image.url

    def validate_total_copies(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Total copies cannot be negative.'
            )
        return value

    def create(self, validated_data):
        # Set available_copies = total_copies on creation
        validated_data['available_copies'] = validated_data.get(
            'total_copies', 1
        )
        return super().create(validated_data)


class BookSuggestionSerializer(serializers.ModelSerializer):
    suggested_by_username = serializers.CharField(
        source='suggested_by.username',
        read_only=True
    )

    class Meta:
        model  = BookSuggestion
        fields = (
            'id', 'suggested_by', 'suggested_by_username',
            'title', 'author', 'isbn', 'reason',
            'status', 'admin_note', 'created_at'
        )
        read_only_fields = ('suggested_by', 'created_at')