from django.test import TestCase
#import User
from application.api.models import Rewards
from datetime import datetime

class RewardsModelTest(TestCase):
    def setUp(self):
        #Set up test user and reward instance
        self.user = User.objects.create_user(username="test_user", password="test_password")
        self.rewards = Rewards.objects.create(user=self.user, reward_number=1)

    def test_reward_creation(self):

    def test_foreign_key_links(self):

    def test_str_method(self):

    def test_reward_retrieval(self):
        #Tests if the reward is correctly retrieved from firebase

    def test_invalid_user_id(self):

    def test_invalid_reward_number(self):

    def test_unique_reward_id(self):

    def test_correct_reward_trigger(self):
        #Test to make sure the user gets correct reward based on trigger
