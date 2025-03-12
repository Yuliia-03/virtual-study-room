from api.models import Friends, Status, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class FriendsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        url_name = request.resolver_match.view_name
        user = request.user

        friends = []
        if url_name == "friends":
            friends = Friends.get_friends_with_status(user, Status.ACCEPTED)
        
        elif url_name == "pending_friends":
            print("Pending friends")
            friends = Friends.get_invitations_received(user)

        elif url_name == "friends_requested":
            print("Friends requested")
            friends = Friends.get_invitations_sent(user)

        elif url_name == "find_friend":
            print("Searching for a new friends...")
            search_query = request.GET.get('q', '')

            users = User.find_user(search_query)
            print(users)

            response_data = []
            for user in users:
                response_data.append({
                    "id": user.id,
                    "name": user.firstname,
                    "surname": user.lastname,
                    "username": user.username
                })
            return Response(response_data, status=status.HTTP_200_OK)

        return self.get_friends(request, friends)

    def get_friends(self, request, data):

        user = request.user
        friends = [(friend.pk, friend.user2) if friend.user1 == user else 
                    (friend.pk, friend.user1) 
                   for friend in data]


        response_data = []
        for friend in friends:
            response_data.append({
                    "id": friend[0],
                    "name": friend[1].firstname,
                    "surname": friend[1].lastname,
                    "username": friend[1].username
            })
        return Response(response_data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        url_name = request.resolver_match.view_name

        if url_name == "accept_friend":
            Friends.update_status(id, Status.ACCEPTED)
        
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, id):
        url_name = request.resolver_match.view_name
        user = request.user

        if url_name == "reject_friend":
            Friends.delete_friend(id, user)

        return Response(status=status.HTTP_200_OK)
