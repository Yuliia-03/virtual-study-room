from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models.study_session import StudySession

@api_view(['POST'])
def create_room(request):
    room = StudySession.objects.create()
    # is using the study session auto generated ID as the room code
    return Response({"roomCode" : str(room.id)})
    # returns the room ID as the room code

@api_view(['POST'])
def join_room(request):
    room_id = request.data.get("roomCode")
    if StudySession.objects.filter(id=room_id).exists():
        return Response({"message": "Joined successfully!"})
    return Response({"error": "Room not found"}, status=404)
