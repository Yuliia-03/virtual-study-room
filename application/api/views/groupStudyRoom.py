from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models.study_session import StudySession

# These are APIs related to the group study room!
# create_room will send create a study session, use the room_id as the room code, and created_by user
# join_room will take the roomCode and add the User to the study session

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    print("API is being called")
    print(request)
    print(request.user)
    print(request.data)
    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=400)

    print("User", user, "is attempting to make a room")
    # use as default session name for now, later take as input field for user to type in
    session_name = "Untitled Study Session"
    #session_name = request.data.get('sessionName', "Untitled Study Session")

    try:
        room = StudySession.objects.create(
                createdBy = user,
                sessionName = session_name
        )
        # is using the study session auto generated ID as the room code
        return Response({"roomCode" : str(room.id)})
        # returns the room ID as the room code
    except Exception as e:
        return Response({"error": f"Failed to create room: {str(e)}"}, status=400)


@api_view(['POST'])
def join_room(request):
    room_id = request.data.get("roomCode")
    if StudySession.objects.filter(id=room_id).exists():
        return Response({"message": "Joined successfully!"})
    return Response({"error": "Room not found"}, status=404)
