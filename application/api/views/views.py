from django.shortcuts import render
from rest_framework.response import Response

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from api.models import User


@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            firstname = data.get("firstname")
            lastname = data.get("lastname")
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            password_confirmation = data.get("passwordConfirmation")

            if password != password_confirmation:
                return JsonResponse({"error": "Passwords do not match"}, status=400)
            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already taken"}, status=400)

            user = User.objects.create_user(
                firstname=firstname, lastname=lastname, username=username, email=email, password=password)

            user.save()

            return JsonResponse({"message": "User registered successfully!"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)
