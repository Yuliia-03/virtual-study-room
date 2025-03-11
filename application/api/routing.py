from django.urls import re_path
from .consumers import RoomConsumer
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/room/(?P<room_id>\w+)/$", RoomConsumer.as_asgi()),
    re_path(r'ws/chat/(?<room_name>\w+)/$', consumers.ChatConsumer),
]
