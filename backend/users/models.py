from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for ASOME Library.

    Roles:
    - ADMIN     → super admin, manages everything
    - LIBRARIAN → manages books, borrows, fines
    - MEMBER    → students who borrow books
    """

    class Role(models.TextChoices):
        ADMIN     = 'ADMIN',     'Admin'
        LIBRARIAN = 'LIBRARIAN', 'Librarian'
        MEMBER    = 'MEMBER',    'Member'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )
    phone_number    = models.CharField(max_length=15, blank=True, null=True)
    address         = models.TextField(blank=True, null=True)
    date_of_birth   = models.DateField(blank=True, null=True)
    email_verified  = models.BooleanField(default=False)
    email_verification_token = models.CharField(
        max_length=255, blank=True, null=True
    )
    student_id      = models.CharField(
        max_length=50, blank=True, null=True,
        help_text='Student ID for ASOME members'
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_librarian(self):
        return self.role == self.Role.LIBRARIAN

    @property
    def is_member(self):
        return self.role == self.Role.MEMBER

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username