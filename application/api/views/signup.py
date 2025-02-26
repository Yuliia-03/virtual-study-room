
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

class NewPasswordMixin:
    """View mixin for validating new_password and password_confirmation fields."""

    password_regex = re.compile(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$')
    password_error_message = (
        "Password must contain an uppercase character, a lowercase character, and a number."
    )

    def validate_password(self, data):
        """Validate new_password and password_confirmation fields."""
        new_password = data.get("new_password")
        password_confirmation = data.get("password_confirmation")
        
        errors = {}

        if not new_password or not password_confirmation:
            errors["new_password"] = "Both password fields are required."

        elif new_password != password_confirmation:
            errors["password_confirmation"] = "Confirmation does not match password."

        elif not self.password_regex.match(new_password):
            errors["new_password"] = self.password_error_message

        return errors

class SignUpView(NewPasswordMixin, APIView):

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

            # Ensuring none of the fields are blank
            missing_fields = [
            field for field in ["firstname", "lastname", "username", "email", "password", "passwordConfirmation"]
            if not data.get(field)
            ]
            if missing_fields:
                return Response({"error": f"Missing required fields: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate Email
            try:
                validate_email(email)
            except ValidationError:
                return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure Passwords match
            if password != password_confirmation:
                return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure username and email are unique
            if User.objects.filter(username=username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

            # Validating the password using the Mixin
            try:
                self.validate_password(data) 
            except ValidationError as e:
                return Response({"error": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)

            # If everything's ok, create the user
            user = User.objects.create_user(
                firstname=firstname, lastname=lastname, username=username, email=email, description=description, password=password)
            user.full_clean()
            user.save()

            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(e)
            return Response({"error": e.message_dict, "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self):
        pass