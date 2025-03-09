from django.http import JsonResponse
from api.models.user import User
from rest_framework.decorators import api_view

@api_view(['GET'])
def checkEmailView(request):
    email = request.query_params.get("email")
    if email and User.objects.filter(email=email).exists():
        return JsonResponse({"exists": True}, status=200)
    return JsonResponse({"exists": False}, status=200)