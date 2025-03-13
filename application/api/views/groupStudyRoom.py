from asgiref.sync import async_to_sync
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import SessionUser
from ..models.study_session import StudySession

# for websockets
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# These are APIs related to the group study room!
# create_room will send create a study session, use the room_id as the room code, and created_by user
# join_room will take the roomCode and add the User to the study session

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request user:", request.user)  # Debugging: Log the user
    print("Request data:", request.data)  # Debugging: Log the request data

    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=401)

    # sets the name, if none given, default name is on the right :)
    session_name = request.data.get('sessionName', "Untitled Study Session - maybe something went wrong?")
    if session_name == "":
        session_name = "We couldn't think of anything :)"


    print("User", user, "is attempting to make a room called:", session_name)
    # use as default session name for now, later take as input field for user to type in
    #session_name = "Untitled Study Session"

    try:
        room = StudySession.objects.create(
                createdBy = user,
                sessionName = session_name
        )
        # is using the study session auto generated ID as the room code

        # Add the user to the participants field
        room.participants.add(user)
        room.save()

        print("User", user, "has successfully made the room:", session_name, "with code:", room.roomCode)
        return Response({"roomCode" : room.roomCode})
        # returns the room ID as the room code
    except Exception as e:
        return Response({"error": f"Failed to create room: {str(e)}"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_room(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request user:", request.user)  # Debugging: Log the user
    print("Request room code:", request.data)

    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=401)

    print("User", user, "is attempting to join room :", request.data.get("roomCode"))
    # takes the room code

    room_code = request.data.get('roomCode')
    if StudySession.objects.filter(roomCode=room_code).exists():
        # Fetch the study session using the room code
        study_session = StudySession.objects.get(roomCode=room_code)

        # Add the user to the participants field
        study_session.participants.add(user)
        study_session.save()

        # Notify all clients in the room
        participants = study_session.participants.all()
        notify_participants(room_code, participants)

        print(f"Notifying participants in room {room_code}: {participants}")

        # create an instance of session user
        session_user = SessionUser.objects.create(
            user = request.user,
            session = study_session,
        )
        return Response({"message": "Joined successfully!"})
    return Response({"error": "Room not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_details(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request query params:", request.query_params)  # Debugging: Log the query parameters

    room_code = request.query_params.get('roomCode')  # Extract roomCode from query params

    print("Retrieving name for the study room", room_code)

    # get the room and get the name of the room
    study_session = StudySession.objects.get(roomCode=room_code)
    session_name = study_session.sessionName
    print("Retrieved the room name", session_name)
    try:
        return Response({"sessionName" : session_name})
        # returns the room name
    except Exception as e:
        return Response({"error": f"Failed to retrieve room details: {str(e)}"}, status=400)

# update the participants in real time as someone joins the room, and leaves the room
def notify_participants(room_code, participants):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"room_{room_code}",
        {
            'type' : 'send_participants',
            'participants' : participants,
        }
    )