from rest_framework.test import APIClient
from django.test import RequestFactory
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import User, List, Permission, toDoList
from api.views.to_do_list import ViewToDoList
from random import choice

class ListViewTestCase(APITestCase):
    fixtures = ['api/tests/fixtures/default_user.json',
                'api/tests/fixtures/default_lists.json',
                'api/tests/fixtures/default_permissions.json', 
                'api/tests/fixtures/default_list_task.json']

    def setUp(self):
        """Set up data for testing using fixtures."""

        self.factory = RequestFactory()
        self.user = User.objects.get(username='@alice123')
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


    def test_delete_task_success(self):
        """Test if the API correctly delete lists"""
        list_to_delete = choice(toDoList.objects.all())
        id = list_to_delete.pk

        response = self.client.delete(f'/api/delete_task/{id}/')

        print("\nDEBUG: Response status code ->", response.status_code)
        print("DEBUG: Response content ->", response.data)

        is_deleted = toDoList.objects.filter(pk=id).exists()


        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertFalse(is_deleted)

        '''list_data = response.data[0]
        self.assertEqual(list_data['id'], self.todo_list.id)
        self.assertEqual(list_data['name'], self.todo_list.name)
        self.assertEqual(list_data['is_shared'], self.todo_list.is_shared)'''

    def test_delete_task_not_found(self):
        response = self.client.delete(
            '/api/delete_task/9999/')  # Non-existing task
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Task doesn't exist")

    def test_delete_list_success(self):
        # Adjust endpoint accordingly
        list_to_delete = choice(List.objects.all())
        id = list_to_delete.pk
        response = self.client.delete(f'/api/delete_list/{id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(List.objects.filter(id=id).exists())
        self.assertFalse(toDoList.objects.filter(list=list_to_delete).exists())
        self.assertFalse(Permission.objects.filter(
            list_id=list_to_delete).exists())

    def test_delete_list_not_found(self):
        response = self.client.delete(
            '/api/delete_list/9999/')  # Non-existing list
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Task doesn't exist")

    def test_invalid_action(self):
        # Simulating a DELETE request
        request = self.factory.delete('/api/invalid_action/')

        # Manually set resolver_match to mimic Django's URL resolver
        request.resolver_match = type(
            '', (), {"view_name": "invalid_action"})()

        # Call the delete method directly
        response = ViewToDoList().delete(request, 30)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid action")

    def test_delete_task_exception(self):
        list_to_delete = choice(toDoList.objects.all())
        id = list_to_delete.pk
        # Create a mock request
        request = self.factory.delete(f'/delete_task/{id}/')

        # Manually set resolver_match to simulate Django's URL resolver
        request.resolver_match = type('', (), {"view_name": "delete_task"})()

        # Force an exception by passing an invalid task_id (string instead of int)
        response = ViewToDoList().delete_task(request, "invalid_id")

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid request", response.data["error"])

    def test_delete_list_exception(self):
        list_to_delete = choice(List.objects.all())
        id = list_to_delete.pk
        # Create a mock request
        request = self.factory.delete(f'/delete_list/{id}/')

        # Manually set resolver_match to simulate Django's URL resolver
        request.resolver_match = type('', (), {"view_name": "delete_list"})()

        # Force an exception by passing an invalid task_id (string instead of int)
        response = ViewToDoList().delete_list(request, "invalid_id")

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid request", response.data["error"])


    def test_patch_task_success(self):
        # Create a mock request
        task = choice(toDoList.objects.all())
        id = task.pk
        response = self.client.patch(f'/api/update_task/{id}/')
        # Manually set resolver_match to simulate Django's URL resolver
        
        # Refresh from database
        task.refresh_from_db()
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(task.is_completed, True)  # The value should toggle
    

def test_patch_task_not_found(self):
    # Create a mock request
    request = self.factory.patch(
        '/api/update_task/9999/')  # Non-existing task

    # Manually set resolver_match to simulate Django's URL resolver
    request.resolver_match = type(
        '', (), {"view_name": "update_task_status"})()

    # Call the patch method
    response = ViewToDoList().patch(request, 9999)

    # Assertions
    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    # Expecting a dict now
    self.assertEqual(response.data, {"error": "Task not found"})
