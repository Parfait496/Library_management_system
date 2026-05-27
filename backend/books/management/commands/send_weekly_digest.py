from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from books.models import Book
from django.contrib.auth import get_user_model
from core.emails import send_weekly_new_books_email

User = get_user_model()


class Command(BaseCommand):
    help = 'Send weekly new books digest email to all members'

    def handle(self, *args, **options):
        # Get books added in the last 7 days
        one_week_ago = timezone.now() - timedelta(days=7)
        new_books = Book.objects.filter(
            created_at__gte=one_week_ago
        ).select_related('genre')

        if not new_books.exists():
            self.stdout.write('No new books this week. Skipping.')
            return

        # Get all active members with email
        members = User.objects.filter(
            role='MEMBER',
            is_active=True,
            email__isnull=False
        ).exclude(email='')

        self.stdout.write(
            f'Sending digest of {new_books.count()} books '
            f'to {members.count()} members...'
        )

        send_weekly_new_books_email(members, new_books)

        self.stdout.write(
            self.style.SUCCESS('Weekly digest sent successfully!')
        )