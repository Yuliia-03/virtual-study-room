# this is for websocket handling
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class RoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.room_code = None

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_id"]
        print(f"Consumers.py Room code: {self.room_code}")  # Debugging: Log the room code
        # Create a name to refer to the room
        self.room_group_name = f"room_{self.room_code}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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
    async def send_participants(self, event):
        participants = event['participants']
        await self.send(text_data=json.dumps({
            'type': 'participants_update',
            'participants': participants,
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