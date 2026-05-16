from rest_framework import serializers
from .models import Genre, Book


class GenreSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Genre
        fields = ('id', 'name', 'description')


class BookSerializer(serializers.ModelSerializer):
    
    is_available = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()

    
    genre_name = serializers.CharField(
        source='genre.name',
        read_only=True
    )

    class Meta:
        model = Book
        fields = (
            'id',
            'isbn',
            'title',
            'author',
            'publisher',
            'publication_year',
            'genre',           
            'genre_name',      
            'description',
            'total_copies',
            'available_copies',
            'cover_image',
            'is_available',
            'availability_status',
            'created_at',
        )
        
        read_only_fields = ('available_copies', 'created_at')

    def get_is_available(self, obj):
        
        return obj.is_available

    def get_availability_status(self, obj):
        return obj.availability_status

    def validate_total_copies(self, value):
        
        if value < 0:
            raise serializers.ValidationError(
                "Total copies cannot be negative."
            )
        return value

    def create(self, validated_data):
        
        # When adding a new book, all copies start as available
        validated_data['available_copies'] = validated_data['total_copies']
        return super().create(validated_data)