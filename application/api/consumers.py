# this is for websocket handling
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import StudySession
from asgiref.sync import sync_to_async

class RoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.room_code = None
        self.username = None
        self.list_id = None


    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        print(f"Consumers.py Room code: {self.room_code}")  # Debugging: Log the room code
        # Create a name to refer to the room
        self.room_group_name = f"room_{self.room_code}"

        # Add the user to the room's group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Fetch and broadcast the updated participants list
        await self.broadcast_participants()


    async def disconnect(self, close_code):
        # Remove the user from the room's group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Fetch and broadcast the updated participants list
        await self.broadcast_participants()

    @sync_to_async
    def get_participants(self):
        # Fetch participants from the StudySession model
        study_session = StudySession.objects.get(roomCode=self.room_code)
        participants = study_session.participants.all()
        return [participant.username for participant in participants]

    async def broadcast_participants(self):
        participants = await self.get_participants()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "participants_update",
                "participants": participants,
            }
        )

    # Method to send to-do list updates to all group participants
    async def broadcast_todo_list(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "add_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "add_task",
                    "task": data["task"],
                }
            )
        elif message_type == "remove_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "remove_task",
                    "task_id": data["task_id"],
                }
            )
        elif message_type == "toggle_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "toggle_task",
                    "task_id": data["task_id"],
                }
            )
            # MAY NOT NEED FUNCTIONALITY TO DELETE LIST, CHECK WITH YULIIA
        elif message_type == "delete_list":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "delete_list",
                    "list_id": data["list_id"],
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "chat_message":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": data["message"],
                    "sender": data["sender"],
                }
            )
        elif message_type == "study_update":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "study_update",
                    "update": data["update"],
                }
            )
        elif message_type == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing",
                    "sender":data["sender"],
                }
            )



    # send an updated list of room participants when someone joins
    async def participants_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "participants_update",
            "participants": event["participants"],
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": event["sender"],
        }))

    async def study_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "study_update",
            "update": event["update"],
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender" : event["sender"],
        }))

    # Methods TO SEND SIGNALS for to do list
    async def add_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "add_task",
            "task": event["task"],
        }))

    async def remove_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "remove_task",
            "task_id": event["task_id"],
        }))

    async def toggle_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "toggle_task",
            "task_id": event["task_id"],
            "is_completed": event["is_completed"],
        }))

    async def delete_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "delete_list",
            "list_id": event["list_id"],
        }))
