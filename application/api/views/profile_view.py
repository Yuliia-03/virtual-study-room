from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ensures only logged in users can access
def get_logged_in_user(request):
    user = request.user  # get authenticated user

    return Response({
        "username": user.username,
        "description": user.description,
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])  # ensures only logged in users can access
def save_description(request):
    user = request.user
    description = request.data.get('description')
    if description is None:
        description = ""
    user.description = description
    user.save()

    return Response({
        "message": "Description updated successfully",
        "username": user.username,
        "description": user.description,
    })