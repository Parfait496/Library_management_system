from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Book, Genre

User = get_user_model()


class BookModelTest(TestCase):
    

    def setUp(self):
        
        self.genre = Genre.objects.create(
            name='Fiction',
            description='Fictional stories'
        )
        self.book = Book.objects.create(
            isbn='9780743273565',
            title='The Great Gatsby',
            author='F. Scott Fitzgerald',
            genre=self.genre,
            total_copies=3,
            available_copies=3
        )

    def test_book_availability_properties(self):
        
        # Book with copies available
        self.assertTrue(self.book.is_available)
        self.assertEqual(self.book.availability_status, '3 available')

        # Simulate all copies being borrowed
        self.book.available_copies = 0
        self.book.save()

        self.assertFalse(self.book.is_available)
        self.assertEqual(self.book.availability_status, 'Not available')

    def test_book_str_representation(self):
        
        expected = 'The Great Gatsby by F. Scott Fitzgerald'
        self.assertEqual(str(self.book), expected)


class BookAPIPermissionTest(APITestCase):
  

    def setUp(self):
        # Create users with different roles
        self.member = User.objects.create_user(
            username='bookmember',
            email='bookmember@test.com',
            password='TestPass123!',
            role='MEMBER'
        )
        self.librarian = User.objects.create_user(
            username='booklibrarian',
            email='booklibrarian@test.com',
            password='TestPass123!',
            role='LIBRARIAN'
        )

        # Create a test genre and book
        self.genre = Genre.objects.create(name='Science')
        self.book = Book.objects.create(
            isbn='9780000000001',
            title='Test Book',
            author='Test Author',
            genre=self.genre,
            total_copies=2,
            available_copies=2
        )

        self.token_url = reverse('token_obtain_pair')
        self.books_url = reverse('api_book_list')

    def get_token(self, username, password):
        
        response = self.client.post(self.token_url, {
            'username': username,
            'password': password
        }, format='json')
        return response.data['access']

    def test_member_cannot_create_book(self):
        
        # Authenticate as member
        token = self.get_token('bookmember', 'TestPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Try to create a book as a member
        response = self.client.post(self.books_url, {
            'isbn': '9780000000099',
            'title': 'Unauthorized Book',
            'author': 'Some Author',
            'total_copies': 1,
        }, format='json')

        # 403 Forbidden — members cannot create books
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_librarian_can_create_book(self):
        
        # Authenticate as librarian
        token = self.get_token('booklibrarian', 'TestPass123!')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Create a book as librarian
        response = self.client.post(self.books_url, {
            'isbn': '9780000000088',
            'title': 'Librarian Created Book',
            'author': 'Some Author',
            'genre': self.genre.pk,
            'total_copies': 2,
        }, format='json')

        # 201 Created — librarian successfully created a book
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify the book was actually saved to the database
        self.assertTrue(
            Book.objects.filter(isbn='9780000000088').exists()
        )