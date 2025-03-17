from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from api.models import StudySession, User
from api.models import SessionUser
from datetime import datetime, time, date, timedelta
from django.utils.timezone import now
from rest_framework.test import APIClient


from rest_framework.test import APITestCase
from rest_framework import status
from api.models import User
from api.models.study_session import StudySession
from django.utils.timezone import now
from datetime import timedelta, date
from rest_framework.test import APIClient


class GetParticipantsTest(APITestCase):

    fixtures = ['api/tests/fixtures/default_user.json']  # Load test data

    def setUp(self):
        """Set up the test data"""
        # Create a user for authentication
        self.user = User.objects.get(username='@alice123')

        # Create a study session (room) with a room code
        self.sessionName = "Test Session"
        self.roomCode = "room123"  # Use the roomCode in the test setup
        self.startTime = now()
        self.endTime = self.startTime + timedelta(hours=2)
        self.date = date.today()

        # Ensure the study session is created with roomCode
        self.session = StudySession.objects.create(
            roomCode=self.roomCode,  # Assign the roomCode here
            createdBy=self.user,
            sessionName=self.sessionName,
            startTime=self.startTime,
            endTime=self.endTime
        )

        # Add participants to the study session
        self.participant1 = User.objects.get(username='@bob456')
        self.participant2 = User.objects.get(username='@username')

        # Associate participants with the study session
        self.session.participants.add(self.participant1, self.participant2)
        self.session.save()

        # Set the URL to test
        self.url = '/api/get-participants/'

        # Authenticate the client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_participants_success(self):
        """Test that the participants are retrieved successfully for the given roomCode"""
        # Make the request with a valid roomCode
        response = self.client.get(self.url, {'roomCode': 'room123'})

        # Check that the response status is OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the response contains the correct participants list
        participants_list = response.data.get('participantsList', [])
        self.assertEqual(len(participants_list), 2)

        # Check that both participants are in the list
        usernames = [participant['username']
                     for participant in participants_list]
        self.assertIn('@bob456', usernames)
        self.assertIn('@username', usernames)

    # Add more tests as needed, like testing invalid roomCode, missing roomCode, etc.

