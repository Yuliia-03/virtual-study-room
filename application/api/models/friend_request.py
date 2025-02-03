from django.db import models
from django.db.models import Q
from .choices import *

class Friends(models.Model):
    #user_id;
    #friend_id;
    #status;
    #created_at;

    user1 = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friendships_initiated")
    user2 = models.ForeignKey('User', on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def save(self, *args, **kwargs):
        """
        Ensure that user1 is always the smaller ID to maintain order
        This will help to avoid adding two lines of data for same 2 friends
        """
        if self.user1_id > self.user2_id:
            self.user1_id, self.user2_id = self.user2_id, self.user1_id
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Friendship between {self.user1_id} and {self.user2_id}"

    @staticmethod
    def are_friends(user_a, user_b):
        """Check if two users are friends (only if status is 'Accepted')."""
        return Friends.objects.filter(
            (Q(user1=user_a, user2=user_b) | Q(user1=user_b, user2=user_a)) &
            Q(status=Status.ACCEPTED)
        ).exists()

    @staticmethod
    def get_friends_with_status(user_1, status):
        """Get all friends of user_1 with a specific status."""
        return Friends.objects.filter(
            (Q(user1=user_1) | Q(user2=user_1)) &
            Q(status=status)
        )