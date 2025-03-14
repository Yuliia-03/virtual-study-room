
from api.models import User
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views import View
import re
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

class SignUpView( APIView):

    def post(self, request):
        try:
            data = request.data  
            firstname = data.get("firstname", "").strip()
            lastname = data.get("lastname", "").strip()
            username = data.get("username", "").strip()
            email = data.get("email", "").strip()
            description = data.get("description", "").strip()
            password = data.get("password")
            password_confirmation = data.get("passwordConfirmation")

            user = User.objects.create_user(
                firstname=firstname, lastname=lastname, username=username, email=email, description=description, password=password)
            user.full_clean()
            user.save()

            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)

        except IntegrityError:  # Handle duplicate email or username
            return Response({"error": "Username or email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        except ValidationError as e:  # Handle invalid email format or other validation issues
            return Response({"error": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:  # Catch all other errors
            return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def get(self):
        pass