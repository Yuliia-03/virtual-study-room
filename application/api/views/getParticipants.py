from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import SessionUser
from ..models.study_session import StudySession

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_participants(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request room_code:", request.data)  # Debugging: Log the room_code

    room_code = request.data.get('roomCode')

    print("Retrieving participants for the study room", room_code)

    # get the room
    study_session = StudySession.objects.get(roomCode=room_code)
    participants = study_session.participants.all()
    participants_list = [{
        'username': participant.username,
    } for participant in participants]

    try:
        return Response({"participantsList" : participants_list})
        # returns the room ID as the room code
    except Exception as e:
        return Response({"error": f"Failed to retrieve participants: {str(e)}"}, status=400)