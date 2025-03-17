from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User

class LoginViewTest(APITestCase):

    fixtures = ['api/tests/fixtures/default_user.json']

    def setUp(self):
        """Set up the test data"""
        self.url = '/api/login/'  # Adjust to the correct URL for login view
        self.user_data = {
            'email': 'alice@example.com',
            'password': 'Password123',
        }
        # Create a user for testing
        self.user = User.objects.get(username='@alice123')

    def test_successful_login(self):
        """Test that a user can login successfully with correct credentials"""
        response = self.client.post(self.url, self.user_data, format='json')

        # Check if the response status is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the response contains refresh and access tokens
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)

        # Check if the response contains userId and username
        self.assertEqual(response.data['userId'], self.user.id)
        self.assertEqual(response.data['username'], self.user.username)

    def test_failed_login_invalid_credentials(self):
        """Test that the user cannot login with incorrect credentials"""
        invalid_data = {
            'email': 'invaliduser@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.url, invalid_data, format='json')

        # Check if the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check if the error message is returned
        self.assertEqual(response.data['error'], 'Invalid Credentials')

    def test_missing_email(self):
        """Test that the user cannot login if email is missing"""
        invalid_data = {
            'password': 'password123'
        }
        response = self.client.post(self.url, invalid_data, format='json')

        # Check if the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check if the error message is returned
        self.assertEqual(response.data['error'], 'Invalid Credentials')

    def test_missing_password(self):
        """Test that the user cannot login if password is missing"""
        invalid_data = {
            'email': 'testuser@example.com'
        }
        response = self.client.post(self.url, invalid_data, format='json')

        # Check if the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check if the error message is returned
        self.assertEqual(response.data['error'], 'Invalid Credentials')

    def test_invalid_email_format(self):
        """Test that the user cannot login with an invalid email format"""
        invalid_data = {
            'email': 'invalid-email-format',
            'password': 'password123'
        }
        response = self.client.post(self.url, invalid_data, format='json')

        # Check if the response status is 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check if the error message is returned
        self.assertEqual(response.data['error'], 'Invalid Credentials')
