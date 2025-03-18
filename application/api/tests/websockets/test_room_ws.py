from channels.testing import WebsocketCommunicator
from api.consumers import RoomConsumer
from api.models import StudySession, User
from channels.db import database_sync_to_async
from channels.routing import URLRouter
from django.urls import re_path
from datetime import datetime, time, timedelta
import json
from django.test import TestCase

# Define a URL router for the WebSocket consumer
application = URLRouter([
    re_path(r"ws/room/(?P<room_code>\w+)/$", RoomConsumer.as_asgi()),
])

class RoomConsumerTests(TestCase):
    fixtures = [
        'api/tests/fixtures/default_user.json'
    ]

    def setUp(self):
        # Create a user for testing
        self.user = User.objects.get(username='@alice123')
        self.user2 = User.objects.get(username='@bob456')

        # Create a test study session
        self.study_session = StudySession.objects.create(createdBy=self.user, sessionName="Test Room")


    async def test_connect_and_disconnect(self):

        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user, sessionName="Test Room")
        user = self.user

        # Connect to the WebSocket
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Disconnect
        await communicator.disconnect()

    async def test_broadcast_participants_on_connect(self):
        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user, sessionName="Test Room")
        user = self.user
        await database_sync_to_async(study_session.participants.add)(user)

        # Connect to the WebSocket
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Receive the participants update
        response = await communicator.receive_json_from()
        self.assertEqual(response, {
            "type": "participants_update",
            "participants": ["@alice123"],
        })

        # Disconnect
        await communicator.disconnect()

    async def test_participants_update(self):
        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user,
                                                                                  sessionName="Test Room")
        user = self.user

        # Connect to the WebSocket
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Add user to the study session
        await database_sync_to_async(study_session.participants.add)(user)

        # Receive the participants update
        response = await communicator.receive_json_from()
        self.assertEqual(response, {
            "type": "participants_update",
            "participants": ["@alice123"],
        })

        # Disconnect
        await communicator.disconnect()

    async def test_multiple_users_in_room(self):
        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user,
                                                                                  sessionName="Test Room")

        # Connect first user
        communicator1 = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator1.connect()
        self.assertTrue(connected)

        # Connect second user
        communicator2 = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator2.connect()
        self.assertTrue(connected)

        # Add users to the study session
        user1 = self.user
        user2 = self.user2
        await database_sync_to_async(study_session.participants.add)(user1, user2)

        # Verify participants update for both users
        response1 = await communicator1.receive_json_from()
        response2 = await communicator2.receive_json_from()
        self.assertEqual(response1, {
            "type": "participants_update",
            "participants": ["@alice123", "@bob456"],
        })
        self.assertEqual(response2, {
            "type": "participants_update",
            "participants": ["@alice123", "@bob456"],
        })

        # Disconnect
        await communicator1.disconnect()
        await communicator2.disconnect()

    async def test_user_leaves_room(self):
        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user,
                                                                                  sessionName="Test Room")
        user = self.user
        await database_sync_to_async(study_session.participants.add)(user)

        # Connect to the WebSocket
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Disconnect the user
        await communicator.disconnect()
        self.assertFalse(connected)


    async def test_invalid_room_code(self):
        # Attempt to connect to a non-existent room
        communicator = WebsocketCommunicator(application, f"ws/room/nonexistentroom/")
        connected, _ = await communicator.connect()
        self.assertFalse(connected)  # Connection should fail


    async def test_user_reconnects(self):
        # Create a test StudySession and User
        study_session = await database_sync_to_async(StudySession.objects.create)(createdBy=self.user,
                                                                                  sessionName="Test Room")
        user = self.user
        await database_sync_to_async(study_session.participants.add)(user)

        # Connect to the WebSocket
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Disconnect and reconnect
        await communicator.disconnect()
        communicator = WebsocketCommunicator(application, f"ws/room/{study_session.roomCode}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Verify that the participants list is still correct
        response = await communicator.receive_json_from()
        self.assertEqual(response, {
            "type": "participants_update",
            "participants": ["@alice123"],
        })

        # Disconnect
        await communicator.disconnect()

    async def test_database_error(self):
        # Attempt to connect to a room without creating a StudySession
        communicator = WebsocketCommunicator(application, f"ws/room/nonexistentroom/")
        connected, _ = await communicator.connect()
        self.assertFalse(connected)  # Connection should fail

