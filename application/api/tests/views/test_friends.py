from rest_framework.test import APIClient
from django.test import RequestFactory
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import User,Friends, Status

class FriendsViewTestCase(APITestCase):
    fixtures = ['api/tests/fixtures/default_user.json',
                'api/tests/fixtures/default_friends.json']

    def setUp(self):
        """Set up data for testing using fixtures."""

        self.factory = RequestFactory()
        self.user = User.objects.get(username='@alice123')
        self.friends = Friends.objects.get(pk=1)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_lists_of_friends(self):
        """Test if the API correctly returns lists for an authenticated user based on permissions."""

        response = self.client.get('/api/get_friends/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = Friends.get_friends_with_status(self.user, Status.ACCEPTED)
        self.assertEqual(len(response.data), len(data))

        list_data = response.data[0]
        self.assertEqual(list_data['id'], 1)
        self.assertEqual(list_data['name'], 'Bob')
        self.assertEqual(list_data['surname'], 'Johnson')
        self.assertEqual(list_data['username'], '@bob456')

    def test_get_invitations_sent(self):
        """Test if the API correctly returns lists for an authenticated user based on permissions."""

        response = self.client.get('/api/get_made_requests/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        check_data = Friends.get_invitations_sent(self.user)
        self.assertEqual(len(response.data), len(check_data))

        list_data = response.data[0]
        self.assertEqual(list_data['id'], check_data[0].id)
        self.assertEqual(list_data['name'], check_data[0].user2.firstname)
        self.assertEqual(list_data['surname'], check_data[0].user2.lastname)
        self.assertEqual(list_data['username'], check_data[0].user2.username)

    def test_get_pending_friends(self):
        """Test if the API correctly returns lists for an authenticated user based on permissions."""

        response = self.client.get('/api/get_pending_friends/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        check_data = Friends.get_invitations_received(self.user)
        self.assertEqual(len(response.data), len(check_data))

        list_data = response.data[0]
        self.assertEqual(list_data['id'], check_data[0].id)
        self.assertEqual(list_data['name'], check_data[0].user2.firstname)
        self.assertEqual(list_data['surname'], check_data[0].user2.lastname)
        self.assertEqual(list_data['username'], check_data[0].user2.username)
        
    def test_accept_friend(self):

        self.assertEqual(Friends.objects.get(pk=4).status, Status.PENDING)
        response = self.client.patch('/api/accept_friend/4/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friends.objects.get(pk=4).status, Status.ACCEPTED)
    
    def test_delete_user(self):

        self.assertEqual(Friends.objects.get(pk=1).status, Status.ACCEPTED)
        response = self.client.delete('/api/reject_friend/1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Friends.objects.get(pk=1).status, Status.PENDING)

    
    def test_get_invalid_request(self):
        """Simulate an invalid action by sending a request with an unknown view name."""

        request = self.client.get('/api/pending_friends/')
