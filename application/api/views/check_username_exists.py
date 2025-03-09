from django.http import JsonResponse
from api.models.user import User
from rest_framework.decorators import api_view

@api_view(['GET'])
def checkUsernameView(request):
    username = request.query_params.get("username")
    if username and User.objects.filter(username=username).exists():
        return JsonResponse({"exists": True}, status=200)
    return JsonResponse({"exists": False}, status=200)