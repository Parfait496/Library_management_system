from django.test import TestCase
from django.contrib.auth import get_user_model
from books.models import Book, Genre
from borrowing.models import BorrowRecord
from .models import Fine
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class FineModelTest(TestCase):
    """Tests for the Fine model"""

    def setUp(self):
        """Set up an overdue borrow record ready for fine testing"""
        self.member = User.objects.create_user(
            username='finemember',
            email='finemember@test.com',
            password='TestPass123!',
            role='MEMBER'
        )
        self.librarian = User.objects.create_user(
            username='finelibrarian',
            email='finelibrarian@test.com',
            password='TestPass123!',
            role='LIBRARIAN'
        )
        self.genre = Genre.objects.create(name='Fine Test Genre')
        self.book = Book.objects.create(
            isbn='9780000000003',
            title='Fine Test Book',
            author='Test Author',
            genre=self.genre,
            total_copies=1,
            available_copies=1
        )

        # Create and process a borrow record
        self.borrow_record = BorrowRecord.objects.create(
            member=self.member,
            book=self.book,
        )
        self.borrow_record.approve(librarian=self.librarian)
        self.borrow_record.mark_borrowed(borrow_days=14)

        # Simulate the book being 3 days overdue
        three_days_ago = timezone.now().date() - timedelta(days=3)
        self.borrow_record.due_date = three_days_ago
        self.borrow_record.status = BorrowRecord.Status.BORROWED
        self.borrow_record.save()

    def test_fine_created_automatically_on_overdue_return(self):
       
        # Confirm book is overdue before returning
        self.assertTrue(self.borrow_record.is_overdue)
        days = self.borrow_record.days_overdue
        expected_amount = days * 100  # 100 RWF per day

        # Return the book — this should trigger fine creation
        self.borrow_record.mark_returned()

        # Fine should now exist in the database
        fine_exists = Fine.objects.filter(
            borrow_record=self.borrow_record
        ).exists()
        self.assertTrue(fine_exists)

        # Get the fine and verify its values
        fine = Fine.objects.get(borrow_record=self.borrow_record)

        # Fine amount should match days overdue × rate
        self.assertEqual(int(fine.amount), expected_amount)

        # Fine should start as UNPAID
        self.assertEqual(fine.status, Fine.Status.UNPAID)

        # Fine member should match the borrower
        self.assertEqual(fine.member, self.member)

    def test_fine_mark_paid(self):
       
        # Create a fine manually for this test
        fine = Fine.objects.create(
            borrow_record=self.borrow_record,
            member=self.member,
            amount=300,       # 3 days × 100 RWF
            days_overdue=3,
            status=Fine.Status.UNPAID
        )

        # Confirm it starts as unpaid
        self.assertFalse(fine.is_paid)

        # Mark it as paid
        fine.mark_paid(resolved_by=self.librarian)

        # Verify it is now paid
        self.assertEqual(fine.status, Fine.Status.PAID)
        self.assertTrue(fine.is_paid)
        self.assertTrue(fine.is_resolved)

        # resolved_date should be set
        self.assertIsNotNone(fine.resolved_date)

        # resolved_by should be the librarian
        self.assertEqual(fine.resolved_by, self.librarian)