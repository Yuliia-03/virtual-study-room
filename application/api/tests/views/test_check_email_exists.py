'''These tests were written by AI'''
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from api.models.user import User

class CheckEmailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_email = "test@example.com"
        self.user = User.objects.create_user(firstname="test", lastname="user", description=" ", username="@testuser", email=self.test_email, password="password123")
        self.url = reverse("check_email")  # Ensure you have a proper URL name in urls.py

    def test_email_exists(self):
        response = self.client.get(self.url, {"email": self.test_email})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": True})

    def test_email_does_not_exist(self):
        response = self.client.get(self.url, {"email": "nonexistent@example.com"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": False})

    def test_missing_email_param(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": False})
