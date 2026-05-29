from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create superuser from environment variables'

    def handle(self, *args, **options):
        import os

        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email    = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@library.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin123!')

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists.')
            )
            return

        try:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role='ADMIN',
                email_verified=True,
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create superuser: {e}')
            )