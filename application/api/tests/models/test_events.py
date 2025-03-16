from django.test import TestCase
from api.models.user import User
from datetime import datetime, timedelta
from api.models.events import Event

class EventModelTest(TestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(email = "test_user@email.com", firstname = "test_user", lastname = "test_user", username = "test_user", password = "test_user")

        
        # Create a test event
        self.event = Event.objects.create(
            user=self.user,
            title='Test Event',
            description='This is a test event',
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=1),
            location='Test Location',
            is_completed=False
        )

    def test_event_creation(self):
        """Test if the event is created properly."""
        self.assertEqual(self.event.title, 'Test Event')
        self.assertEqual(self.event.description, 'This is a test event')
        self.assertEqual(self.event.location, 'Test Location')
        self.assertFalse(self.event.is_completed)
        self.assertEqual(self.event.user, self.user)
    
    def test_event_completion(self):
        """Test marking the event as completed."""
        self.event.is_completed = True
        self.event.save()
        completed_event = Event.objects.get(id=self.event.id)
        self.assertTrue(completed_event.is_completed)

    def test_event_time_validation(self):
        """Test that event end time is after the start time."""
        self.assertTrue(self.event.end_time > self.event.start_time)

    def test_event_string_representation(self):
        """Test the string representation of the event."""
        self.assertEqual(str(self.event), 'Test Event')

    def test_event_updating(self):
        """Test updating an event's title and description."""
        self.event.title = 'Updated Event'
        self.event.description = 'Updated Description'
        self.event.save()
        updated_event = Event.objects.get(id=self.event.id)
        self.assertEqual(updated_event.title, 'Updated Event')
        self.assertEqual(updated_event.description, 'Updated Description')

    def test_event_deletion(self):
        """Test deleting an event."""
        event_id = self.event.id
        self.event.delete()
        with self.assertRaises(Event.DoesNotExist):
            Event.objects.get(id=event_id)

