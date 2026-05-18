from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from books.models import Book

User = get_user_model()

class BorrowRecord(models.Model):

    class Status(models.TextChoices):

        REQUESTED = 'REQUESTED', 'Requested'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        BORROWED = 'BORROWED', 'Borrowed'
        RETURNED = 'RETURNED', 'Returned'
        OVERDUE = 'OVERDUE', 'Overdue'

    member = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='borrow_records'
    )

    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='borrow_records'
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED
    )

    request_date = models.DateTimeField(auto_now_add=True)


    approved_date = models.DateTimeField(null=True, blank=True)


    borrow_date = models.DateTimeField(null=True, blank=True)


    due_date = models.DateTimeField(null=True, blank=True)


    return_date = models.DateTimeField(null=True, blank=True)


    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='processed_borrows'
    )


    librarian_note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']


    def __str__(self):
        return f"{self.member.username} → {self.book.title} [{self.status}]"
    

    # Properties

    @property
    def is_overdue(self):

        if self.due_date and self.status == self.Status.BORROWED:
            return timezone.now().date() > self.due_date
        return False
    
    @property
    def days_overdue(self):
        if self.is_overdue:
            delta = timezone.now().date() - self.due_date
            return delta.days
        return 0
    
    @property
    def fine_amount(self):
        FINE_PER_DAY = 100
        return self.days_overdue * FINE_PER_DAY
    

    def approve(self, librarian):

        self.status = self.status.APPROVED
        self.approved_date = timezone.now()
        self.processed_by = librarian
        self.save()
    
    def reject(self, librarian, note=''):
        self.status = self.Status.REJECTED
        self.processed_by = librarian
        self.librarian_note = note
        self.save()

    def mark_borrowed(self, borrow_days=14):

        self.status = self.Status.BORROWED
        self.borrow_date = timezone.now()

        from datetime import timedelta
        self.due_date = timezone.now().date() + timedelta(days=borrow_days)
        self.save()

        book = self.book
        if book.available_copies > 0:
            book.available_copies -= 1
            book.save()

    def mark_returned(self):

        days = self.days_overdue
        self.status = self.Status.RETURNED
        self.return_date = timezone.now()
        self.save()

        book = self.book
        book.available_copies += 1
        book.save()

        if days > 0:
            from fines.models import Fine
            Fine.objects.get_or_create(
                borrow_record=self,
                defaults={
                    'member': self.member,
                    'amount': days * 100,  # 100 RWF per day
                    'days_overdue': days,
                }
            )

    def mark_overdue(self):
        if self.is_overdue:
            self.status = self.Status.OVERDUE
            self.save()