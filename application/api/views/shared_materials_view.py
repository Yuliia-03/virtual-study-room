from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.session_user import SessionUser

@api_view(['GET'])
@permission_classes([IsAuthenticated])  #ensures only logged in users can access
def get_current_session(request):
    user = request.user
    #find the session where the user is either the creator or a participant
    session_user = SessionUser.objects.filter(
        user=user,
        session__endTime__isnull=True,  #session is still active
        left_at__isnull=True  #user hasn't left the session
    ).order_by('-joined_at').first()  #order by most recent join

    if session_user:
        session = session_user.session
        return Response({
            "session_id": session.id,
            "roomCode": session.roomCode,
        })
    else:
        return Response({'error': 'No active session found'}, status=404)