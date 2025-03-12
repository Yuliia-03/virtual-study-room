'''Tests of the Motivational Messages view'''
from django.test import TestCase
from django.urls import reverse
from api.models.motivational_message import MotivationalMessage
from api.models.user import User
from rest_framework.test import APIClient
from random import seed

class MotivationalMessageViewTestCase(TestCase):
    '''Tests of the Motivational Messages view'''

    def setUp(self):
        # using seed for predictable random behaviour in tests
        seed(42)

        # creating a test user
        self.motivation1 = MotivationalMessage.objects.create(text = "Always make sure you’re doing little experiments every day to move yourself forward on the things you’re interested in.")
        self.motivation2 = MotivationalMessage.objects.create(text = "The sun will come out tomorrow!")
        self.motivation3 = MotivationalMessage.objects.create(text = "Just do it!")
        self.url = reverse("motivation")
        self.client = APIClient()

    def test_display_motivational_message(self):
        # Login in as a user

        # Send request and check response
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

        # check if returned message is one of the expected ones
        possible_messages = {self.motivation1.text, self.motivation2.text, self.motivation3.text}
        self.assertIn('message', response.json())
        self.assertIn(response.json()['message'], possible_messages)