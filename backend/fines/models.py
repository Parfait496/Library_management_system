from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from borrowing.models import BorrowRecord

User = get_user_model()


class Fine(models.Model):
    """
    Represents a fine issued for returning a book late.
    Created automatically when an overdue book is returned.
    Fine rate: 100 RWF per day overdue.
    """

    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PAID   = 'PAID',   'Paid'
        WAIVED = 'WAIVED', 'Waived'

    borrow_record = models.OneToOneField(
        BorrowRecord,
        on_delete=models.CASCADE,
        related_name='fine'
    )
    member = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='fines'
    )
    amount      = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    days_overdue = models.IntegerField(default=0)
    status       = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.UNPAID
    )
    issued_date   = models.DateTimeField(auto_now_add=True)
    resolved_date = models.DateTimeField(null=True, blank=True)
    resolved_by   = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='resolved_fines'
    )
    note = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-issued_date']

    def __str__(self):
        return (
            f"Fine: {self.member.username} — "
            f"{self.amount} RWF [{self.status}]"
        )

    @property
    def is_paid(self):
        return self.status == self.Status.PAID

    @property
    def is_resolved(self):
        return self.status in [self.Status.PAID, self.Status.WAIVED]

    def mark_paid(self, resolved_by):
        self.status       = self.Status.PAID
        self.resolved_date = timezone.now()
        self.resolved_by  = resolved_by
        self.save()

    def waive(self, resolved_by, note=''):
        self.status        = self.Status.WAIVED
        self.resolved_date = timezone.now()
        self.resolved_by   = resolved_by
        self.note          = note
        self.save()

    @classmethod
    def create_from_borrow_record(cls, borrow_record):
        """Creates a fine from an overdue borrow record"""
        if borrow_record.days_overdue > 0:
            fine, created = cls.objects.get_or_create(
                borrow_record=borrow_record,
                defaults={
                    'member':      borrow_record.member,
                    'amount':      borrow_record.fine_amount,
                    'days_overdue': borrow_record.days_overdue,
                }
            )
            return fine
        return None