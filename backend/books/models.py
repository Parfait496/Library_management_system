from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from simple_history.models import HistoricalRecords

User = get_user_model()


class Genre(models.Model):
    """Book genre — belongs to a specific library"""
    name    = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    parent      = models.ForeignKey(        
        'self',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='subcategories',
        help_text='Leave blank for a top-level category.'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['parent__name', 'name']
        unique_together = ['name', 'parent']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name

    @property                                  # ← NEW
    def is_top_level(self):
        return self.parent_id is None

    @property                                  # ← NEW
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name

    history = HistoricalRecords()

class Book(models.Model):
    """Book — belongs to a specific library"""

    # ISBN no longer unique globally
    # Same book can exist in multiple libraries
    isbn   = models.CharField(max_length=13, blank=True, null=True)
    title  = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publisher        = models.CharField(max_length=255, blank=True, null=True)
    publication_year = models.IntegerField(
        blank=True, null=True,
        validators=[MinValueValidator(1000)]
    )
    genre = models.ForeignKey(
        Genre,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='books'
    )
    description     = models.TextField(blank=True, null=True)
    total_copies     = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    available_copies = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    cover_image      = models.ImageField(
        upload_to='book_covers/',
        blank=True, null=True
    )
    added_by   = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
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

    history = HistoricalRecords()

class BookSuggestion(models.Model):
    """Members suggest books for their library to acquire"""

    class Status(models.TextChoices):
        PENDING  = 'PENDING',  'Pending'
        REVIEWED = 'REVIEWED', 'Reviewed'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    
    suggested_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='book_suggestions'
    )
    title      = models.CharField(max_length=255)
    author     = models.CharField(max_length=255)
    isbn       = models.CharField(max_length=13, blank=True, null=True)
    reason     = models.TextField(blank=True, null=True)
    status     = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    admin_note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — suggested by {self.suggested_by.username}"