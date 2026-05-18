from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from borrowing.models import BorrowRecord

User = get_user_model()


class Fine(models.Model):
    """
    Represents a fine issued to a member for returning a book late.

    A Fine is created when a book is returned and it was overdue.
    It tracks:
    - How much is owed
    - Whether it has been paid
    - Who issued it and when

    Fine calculation:
    - 100 RWF per day overdue
    - Fine amount is calculated from BorrowRecord.fine_amount property
    """

    class Status(models.TextChoices):
        """Fine payment status"""
        UNPAID = 'UNPAID', 'Unpaid'   # fine issued, not yet paid
        PAID   = 'PAID',   'Paid'     # member has paid the fine
        WAIVED = 'WAIVED', 'Waived'   # librarian/admin waived the fine

    # One fine belongs to one borrow record
    # If the borrow record is deleted, the fine is also deleted
    borrow_record = models.OneToOneField(
        BorrowRecord,
        on_delete=models.CASCADE,
        related_name='fine'  # lets you do borrow_record.fine
    )

    # The member who owes the fine
    # Stored separately for quick lookup without joining BorrowRecord
    member = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='fines'  # lets you do user.fines.all()
    )

    # The fine amount in RWF
    # This is set when the fine is created based on days overdue
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # How many days the book was overdue
    # Stored so we have a record even after the borrow record changes
    days_overdue = models.IntegerField(default=0)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.UNPAID
    )

    # When the fine was issued
    issued_date = models.DateTimeField(auto_now_add=True)

    # When the fine was paid or waived
    resolved_date = models.DateTimeField(null=True, blank=True)

    # Who resolved (paid/waived) this fine
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_fines'
    )

    # Optional note from librarian (e.g. reason for waiving)
    note = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-issued_date']  # newest fines first

    def __str__(self):
        return (
            f"Fine: {self.member.username} — "
            f"{self.amount} RWF [{self.status}]"
        )

    # -------------------------------------------------------------------
    # PROPERTIES
    # -------------------------------------------------------------------

    @property
    def is_paid(self):
        """Returns True if fine has been paid"""
        return self.status == self.Status.PAID

    @property
    def is_resolved(self):
        """Returns True if fine is paid or waived"""
        return self.status in [self.Status.PAID, self.Status.WAIVED]

    # -------------------------------------------------------------------
    # METHODS — actions that change the fine's state
    # -------------------------------------------------------------------

    def mark_paid(self, resolved_by):
        """
        Called when a member pays their fine.
        Records who processed the payment and when.
        """
        self.status = self.Status.PAID
        self.resolved_date = timezone.now()
        self.resolved_by = resolved_by
        self.save()

    def waive(self, resolved_by, note=''):
        """
        Called when a librarian or admin waives the fine.
        For example: if the delay was due to an emergency.
        """
        self.status = self.Status.WAIVED
        self.resolved_date = timezone.now()
        self.resolved_by = resolved_by
        self.note = note
        self.save()

    @classmethod
    def create_from_borrow_record(cls, borrow_record):
        """
        Class method — creates a Fine from a BorrowRecord.
        Called automatically when a book is returned overdue.

        classmethod means we call it on the class itself:
        Fine.create_from_borrow_record(record)
        instead of on an instance.
        """
        # Only create a fine if the book was actually overdue
        if borrow_record.days_overdue > 0:
            # get_or_create prevents duplicate fines
            # Returns (fine_object, created_boolean)
            fine, created = cls.objects.get_or_create(
                borrow_record=borrow_record,
                defaults={
                    'member': borrow_record.member,
                    'amount': borrow_record.fine_amount,
                    'days_overdue': borrow_record.days_overdue,
                }
            )
            return fine
        return None