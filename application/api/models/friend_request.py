from django.db import models
from django.db.models import Q
from .choices import *


'''
Friends model represents a friendship between two users.
It ensures that each friendship is stored only once using a unique constraint
and enforces order to prevent duplicate entries (e.g., storing both (1,2) and (2,1)).
'''

class Friends(models.Model):

    user1 = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friendships_initiated")
    user2 = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def save(self, *args, **kwargs):
        '''
        Ensure that user1 is always the smaller ID to maintain order
        This will help to avoid adding two lines of data for same 2 friends
        '''
        if self.user1_id > self.user2_id:
            self.user1_id, self.user2_id = self.user2_id, self.user1_id
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Friendship between {self.user1.firstname} {self.user1.lastname} and {self.user2.firstname} {self.user2.lastname}"

    @staticmethod
    def are_friends(user_a, user_b):
        '''
        Check if two users are friends (only if status is 'Accepted').

        :param user_a: First user
        :param user_b: Second user
        :return: Boolean (True if they are friends, False otherwise)
        '''
        return Friends.objects.filter(
            (Q(user1=user_a, user2=user_b) | Q(user1=user_b, user2=user_a)) &
            Q(status=Status.ACCEPTED)
        ).exists()

    @staticmethod
    def get_friends_with_status(user_1, status):
        '''
        Get all friends of a user with a specific friendship status.

        :param user_1: The user whose friends we want to fetch
        :param status: The status of the friendship (Pending, Accepted, Rejected)
        :return: Queryset of Friends objects matching the criteria
        '''
        return Friends.objects.filter(
            (Q(user1=user_1) | Q(user2=user_1)) &
            Q(status=status)
        )
