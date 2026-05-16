from django.contrib import admin
from .models import Genre, Book


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
   
    list_display = (
        'title', 'author', 'isbn',
        'genre', 'total_copies',
        'available_copies', 'created_at'
    )

    
    list_filter = ('genre', 'created_at')

    
    search_fields = ('title', 'author', 'isbn')

    
    list_editable = ('available_copies',)