from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Genre(models.Model):
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        
        ordering = ['name']

    def __str__(self):
        return self.name


class Book(models.Model):
    
    isbn = models.CharField(max_length=13, unique=True)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    publication_year = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1000)]
    )

    
    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books'  
    )

    description = models.TextField(blank=True, null=True)

    # Total physical copies the library owns
    total_copies = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)]
    )

    
    available_copies = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)]
    )

    
    cover_image = models.ImageField(
        upload_to='book_covers/',
        blank=True,
        null=True
    )

    
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books_added'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']  

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def is_available(self):
        
        return self.available_copies > 0

    @property
    def availability_status(self):
        
        if self.available_copies > 0:
            return f"{self.available_copies} available"
        return "Not available"