from django.forms import ValidationError
from django.test import TestCase, override_settings
from api.models.todo_list import toDoList
from datetime import date, timedelta

""" Creating toDoList Model Tests"""

@override_settings(MIGRATION_MODULES={"api": None})
class toDoListModelTest(TestCase):
    """Creating test toDoList objects"""
    def setUp(self):
        self.todo = toDoList.objects.create(
            title = "Test task",
            content = "This is Content of a to do list item.",
            is_completed = True,
            is_shared = True
        )
        self.todo2 = toDoList.objects.create(
            title = "Test task2",
            content = ""
        )

    """Testing whether the todo object has been created correctly"""
    def test_toDo_create(self):
        self.assertEqual(self.todo.title, "Test task")
        self.assertEqual(self.todo.content, "This is Content of a to do list item.")
        self.assertEqual(self.todo.is_completed, True)
        self.assertEqual(self.todo.is_shared, True)

    """Testing whether a blank title is shown correctly as invalid"""
    def test_blank_title_is_invalid(self):
        self.todo.title = ""
        with self.assertRaises(ValidationError):
            self.todo.full_clean()

    """Testing whether a title exceeding the max_length is correctly shown as invalid"""
    def test_overlong_title_is_invalid(self):
        self.todo.title = "x" * 256
        with self.assertRaises(ValidationError):
            self.todo.full_clean()

    """Testing whether default values and blank content is accepted in a toDoList object"""
    def test_default_values_and_blank_content_is_valid(self):
        try:
            self.todo2.full_clean()
        except ValidationError:
            self.fail("Default test todo should be deemed valid")

        self.assertFalse(self.todo2.is_completed, "should be set to False")
        self.assertFalse(self.todo2.is_shared, "should be set to False")

        try:
            self.todo2.full_clean()
        except ValidationError:
            self.fail("Content can be set empty")

    """Testing whether an invalid boolean field is correctly shown as invalid"""
    def test_boolean_field_invalid(self):
         with self.assertRaises(ValidationError):
            todo3 = toDoList.objects.create(title="Invalid Bool", is_completed="yes")
            todo3.full_clean()

    """Testing that after each object is created, the new toDoList object's list_id is incremented"""
    def test_auto_increment_list_id(self):
        self.assertEqual(self.todo2.list_id, self.todo.list_id + 1)

    """Testing is the list_id is unique for every todoList object"""
    def test_listId_is_unique(self):
        self.assertNotEqual(self.todo.list_id, self.todo2.list_id)

    """Testing if the creation_date is set to the date when the toDoList object was created"""
    def test_creation_date_is_valid(self):
        self.assertEqual(self.todo.creation_date, date.today())

    """Testing if the creation_date is not amendable after the toDoList object has been created"""
    def test_creation_date_is_read_only(self):
        original_date = self.todo.creation_date
        with self.assertRaises(ValidationError):
            self.todo.creation_date = original_date - timedelta(days=1)
            self.todo.save() 

    """Testing if another toDoList object is created on the same day, then it should have the same creation_date as the previous toDoList object"""
    def test_creation_date_with_multiple_objects_is_valid(self):
        todoLater = toDoList.objects.create(title="Test task3")
        self.assertEqual(todoLater.creation_date, date.today())
        self.assertEqual(self.todo.creation_date, todoLater.creation_date)

    """Testing the string method, seeing if it outputs the correct expected message"""
    def test_str(self):
        expected_str = f'Test task has list_id {self.todo.list_id}'
        self.assertEqual(str(self.todo), expected_str)


