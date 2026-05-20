from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTest(TestCase):
    

    def setUp(self):
        
        # Create one user of each role for testing
        self.admin = User.objects.create_user(
            username='testadmin',
            email='admin@test.com',
            password='TestPass123!',
            role='ADMIN'
        )
        self.librarian = User.objects.create_user(
            username='testlibrarian',
            email='librarian@test.com',
            password='TestPass123!',
            role='LIBRARIAN'
        )
        self.member = User.objects.create_user(
            username='testmember',
            email='member@test.com',
            password='TestPass123!',
            role='MEMBER'
        )

    def test_user_role_properties(self):
        
        # Admin properties
        self.assertTrue(self.admin.is_admin)
        self.assertFalse(self.admin.is_librarian)
        self.assertFalse(self.admin.is_member)

        # Librarian properties
        self.assertTrue(self.librarian.is_librarian)
        self.assertFalse(self.librarian.is_admin)
        self.assertFalse(self.librarian.is_member)

        # Member properties
        self.assertTrue(self.member.is_member)
        self.assertFalse(self.member.is_admin)
        self.assertFalse(self.member.is_librarian)

    def test_default_role_is_member(self):
        
        # Create a user without specifying role
        user = User.objects.create_user(
            username='newuser',
            email='new@test.com',
            password='TestPass123!'
            # no role specified — should default to MEMBER
        )
        self.assertEqual(user.role, 'MEMBER')
        self.assertTrue(user.is_member)

    def test_user_str_representation(self):
        
        self.assertEqual(str(self.admin), 'testadmin (ADMIN)')
        self.assertEqual(str(self.librarian), 'testlibrarian (LIBRARIAN)')
        self.assertEqual(str(self.member), 'testmember (MEMBER)')


class JWTAuthAPITest(APITestCase):
    

    def setUp(self):
        self.member = User.objects.create_user(
            username='apitestuser',
            email='apitest@test.com',
            password='TestPass123!',
            role='MEMBER'
        )

        # URLs we will test
        self.token_url = reverse('token_obtain_pair')
        self.register_url = reverse('api_register')
        self.profile_url = reverse('api_profile')

    def test_jwt_login_returns_tokens(self):
        
        # Send login request with valid credentials
        response = self.client.post(self.token_url, {
            'username': 'apitestuser',
            'password': 'TestPass123!'
        }, format='json')

        # 200 OK means login was successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Response must contain both tokens
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_unauthenticated_cannot_access_profile(self):
        
        # Make request WITHOUT any token
        response = self.client.get(self.profile_url)

        # 401 Unauthorized — no token provided
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_access_profile(self):
        
        # First get a token by logging in
        login_response = self.client.post(self.token_url, {
            'username': 'apitestuser',
            'password': 'TestPass123!'
        }, format='json')

        access_token = login_response.data['access']

        # Set the token on the client for all future requests
        # This simulates what a frontend does with Authorization header
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )

        # Now access the profile endpoint
        response = self.client.get(self.profile_url)

        # 200 OK — authenticated successfully
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the returned data belongs to our user
        self.assertEqual(response.data['username'], 'apitestuser')