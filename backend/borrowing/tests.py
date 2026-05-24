from django.test import TestCase
from django.contrib.auth import get_user_model
from books.models import Book, Genre
from .models import BorrowRecord
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class BorrowRecordModelTest(TestCase):

    def setUp(self):
        """Create test users and a book for borrowing tests"""
        self.member = User.objects.create_user(
            username='borrowmember',
            email='borrowmember@test.com',
            password='TestPass123!',
            role='MEMBER'
        )
        self.librarian = User.objects.create_user(
            username='borrowlibrarian',
            email='borrowlibrarian@test.com',
            password='TestPass123!',
            role='LIBRARIAN'
        )
        self.genre = Genre.objects.create(name='Test Genre')
        self.book = Book.objects.create(
            isbn='9780000000002',
            title='Borrow Test Book',
            author='Test Author',
            genre=self.genre,
            total_copies=2,
            available_copies=2
        )

        # Create a borrow record in REQUESTED status
        self.borrow_record = BorrowRecord.objects.create(
            member=self.member,
            book=self.book,
        )

    def test_borrow_lifecycle_status_transitions(self):
        
        # Initial status should be REQUESTED
        self.assertEqual(
            self.borrow_record.status,
            BorrowRecord.Status.REQUESTED
        )

        # Approve the request
        self.borrow_record.approve(librarian=self.librarian)
        self.assertEqual(
            self.borrow_record.status,
            BorrowRecord.Status.APPROVED
        )
        # approved_date should now be set
        self.assertIsNotNone(self.borrow_record.approved_date)

        # Mark as borrowed — decreases available copies
        copies_before = self.book.available_copies
        self.borrow_record.mark_borrowed(borrow_days=14)
        self.assertEqual(
            self.borrow_record.status,
            BorrowRecord.Status.BORROWED
        )

        # Reload book from DB to check updated copies
        self.book.refresh_from_db()
        self.assertEqual(
            self.book.available_copies,
            copies_before - 1  # one copy was taken
        )

        # due_date should be 14 days from today
        expected_due = timezone.now().date() + timedelta(days=14)
        self.assertEqual(self.borrow_record.due_date, expected_due)

        # Mark as returned — increases available copies
        self.borrow_record.mark_returned()
        self.assertEqual(
            self.borrow_record.status,
            BorrowRecord.Status.RETURNED
        )

        # Available copies should be restored
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, copies_before)

    def test_overdue_detection(self):
        
        # Approve and mark as borrowed first
        self.borrow_record.approve(librarian=self.librarian)
        self.borrow_record.mark_borrowed(borrow_days=14)

        # Manually set due_date to yesterday to simulate overdue
        yesterday = timezone.now().date() - timedelta(days=1)
        self.borrow_record.due_date = yesterday
        self.borrow_record.save()

        # is_overdue should now be True
        self.assertTrue(self.borrow_record.is_overdue)

        # days_overdue should be at least 1
        self.assertGreaterEqual(self.borrow_record.days_overdue, 1)

        # fine_amount should be greater than 0 (100 RWF per day)
        self.assertGreater(self.borrow_record.fine_amount, 0)

    def test_reject_request(self):
        
        copies_before = self.book.available_copies

        # Reject the request
        self.borrow_record.reject(
            librarian=self.librarian,
            note='Book reserved for another member.'
        )

        # Status should be REJECTED
        self.assertEqual(
            self.borrow_record.status,
            BorrowRecord.Status.REJECTED
        )

        # Librarian note should be saved
        self.assertEqual(
            self.borrow_record.librarian_note,
            'Book reserved for another member.'
        )

        # Available copies should NOT change on rejection
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, copies_before)