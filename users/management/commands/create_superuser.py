from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    """
    Custom management command to create a superuser
    from environment variables.
    Called in build.sh during deployment.
    Usage: python manage.py create_superuser
    """
    help = 'Create superuser from environment variables'

    def handle(self, *args, **options):
        username = config('DJANGO_SUPERUSER_USERNAME', default='admin')
        email = config('DJANGO_SUPERUSER_EMAIL', default='admin@library.com')
        password = config('DJANGO_SUPERUSER_PASSWORD', default='Admin123!')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role='ADMIN'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser {username} created.')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Superuser {username} already exists.')
            )