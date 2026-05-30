import os
import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create superuser from environment variables'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@library.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin123!')

        self.stdout.write(f'Checking for superuser: {username}')

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists.')
            )
            return

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role='ADMIN',
            )
            # Set email_verified if field exists
            if hasattr(user, 'email_verified'):
                user.email_verified = True
                user.save(update_fields=['email_verified'])

            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )
            # Print full traceback
            import traceback
            traceback.print_exc()