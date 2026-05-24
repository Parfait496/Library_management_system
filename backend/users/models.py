from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
     #add  roles based access

    class Role(models.TextChoices):
          ADMIN = 'ADMIN', 'admin'
          LIBRARIAN = 'LIBRARIAN', 'librarian'
          MEMBER = 'MEMBER', 'member'

    role = models.CharField(
         max_length=20,
         choices=Role.choices,
         default=Role.MEMBER,
    )

    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
         upload_to='profile_picture/',
         blank=True,
         null=True
    )

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
         return f"{self.username} ({self.role})"
    

    # Role helper properties (used in views and templates)

    @property
    def is_admin(self):
         return self.role == self.Role.ADMIN
    
    @property
    def is_librarian(self):
         return self.role == self.Role.LIBRARIAN
    
    @property
    def is_member(self):
         return self.role == self.Role.MEMBER




