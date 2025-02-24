from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import User, List, Permission, toDoList


class ListViewTestCase(APITestCase):
    fixtures = ['api/tests/fixtures/default_user.json',
                'api/tests/fixtures/default_lists.json',
                'api/tests/fixtures/default_permissions.json', 
                'api/tests/fixtures/default_list_task.json']

    def setUp(self):
        """Set up data for testing using fixtures."""
        self.user = User.objects.get(username='alice123')
        self.todo_list = List.objects.get(name='Default List1')

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_lists_for_user(self):
        """Test if the API correctly returns lists for an authenticated user based on permissions."""

        response = self.client.get('/api/todolists/false/')

        print("\nDEBUG: Response status code ->", response.status_code)
        print("DEBUG: Response content ->", response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 2)

        list_data = response.data[0]
        self.assertEqual(list_data['id'], self.todo_list.id)
        self.assertEqual(list_data['name'], self.todo_list.name)
        self.assertEqual(list_data['is_shared'], self.todo_list.is_shared)
