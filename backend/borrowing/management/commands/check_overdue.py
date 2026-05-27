from django.core.management.base import BaseCommand
from django.utils import timezone
from borrowing.models import BorrowRecord
from core.emails import send_overdue_reminder_email


class Command(BaseCommand):
    help = 'Check for overdue books and send reminder emails'

    def handle(self, *args, **options):
        today = timezone.now().date()

        # Find borrowed books past due date
        overdue_records = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.BORROWED,
        ).select_related('member', 'book')

        count = 0
        for record in overdue_records:
            due = record.due_date
            if due:
                # Convert to date if datetime
                if hasattr(due, 'date'):
                    due = due.date()
                if today > due:
                    # Mark as overdue
                    record.mark_overdue()
                    # Send email reminder
                    send_overdue_reminder_email(record)
                    count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Found and notified {count} overdue record(s).'
            )
        )