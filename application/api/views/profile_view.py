from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # ensures only logged in users can access (do we need this?)
def get_logged_in_user(request):
    user = request.user  #get authenticated user

    return Response({
        "username": user.username,
        # "description": user.description, # the user doesn't have a description
        "user_id": user.id,  # needed for firebase image retrieval
    })