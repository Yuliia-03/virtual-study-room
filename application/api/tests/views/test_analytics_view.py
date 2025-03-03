# Set up a test user with required fields (streaks, hours_studied, total_sessions).
# Authenticate the test user using Django’s test authentication.
# Make a GET request to the get_analytics endpoint.
# Assert the expected response to verify correctness.
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AnalyticsTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="@testUser",
            firstname="test",
            lastname="user",
            email="testuser@email.com",
            description = "Testing",
            password="Test123",
            streaks=11,
            hours_studied=10,
            total_sessions=2
        )

        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_get_analytics_success(self):
        response = self.client.get('/api/analytics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["streaks"], self.user.streaks)
        self.assertEqual(response.data["average_study_hours"], round(self.user.hours_studied / self.user.total_sessions, 2))

    def test_get_analytics_unauthenticated(self):
        self.client.credentials()
        response = self.client.get('/api/analytics/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
