'''These tests were written by AI'''
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from api.models.user import User

class CheckEmailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_username = "@testuser"
        self.user = User.objects.create_user(firstname="test", lastname="user", description=" ", username=self.test_username, email="test@example.com", password="password123")
        self.url = reverse("check_username")  # Ensure you have a proper URL name in urls.py

    def test_username_exists(self):
        response = self.client.get(self.url, {"username": self.test_username})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": True})

    def test_username_does_not_exist(self):
        response = self.client.get(self.url, {"username": "@nonexistant"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": False})

    def test_missing_username_param(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"exists": False})
