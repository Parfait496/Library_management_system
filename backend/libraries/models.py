# libraries/models.py
from django.db import models
import uuid


class Library(models.Model):
    """
    Represents a library institution.
    Each university or organization gets their own library.
    Members, books, and borrows belong to a specific library.
    """

    # Unique code for the library — used in URLs
    # e.g. university-of-kigali, inilak, ur
    slug = models.SlugField(
        unique=True,
        max_length=100,
        help_text='Unique URL-friendly identifier e.g. university-of-kigali'
    )

    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=20, blank=True)
    address     = models.TextField(blank=True)
    website     = models.URLField(blank=True)
    logo        = models.ImageField(
        upload_to='library_logos/',
        blank=True, null=True
    )

    # Join code — members use this to join the library
    # Like a class code in Google Classroom
    join_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Libraries'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generate join code if not set
        if not self.join_code:
            import secrets
            self.join_code = secrets.token_urlsafe(8).upper()[:10]
        super().save(*args, **kwargs)