from django.contrib.auth.mixins import LoginRequiredMixin
from api.models import Friends, Status, Permission
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views import View
from rest_framework.permissions import IsAuthenticated


class FriendsView(APIView):


    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friendships = Friends.get_friends_with_status(
            user_1=user, status=Status.ACCEPTED)
        friends = [friend.user2 if friend.user1 ==
                   user else friend.user1 for friend in friendships]

        response_data = []
        for user in friends:
            response_data.append({
                "id": user.id,
                "name": user.firstname,
                "surname": user.lastname,
                "username": user.username
            })

        return Response(response_data, status=status.HTTP_200_OK)





