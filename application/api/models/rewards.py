from django.db import models
from .user import User

'''
This is the model for handling rewards for users based on their study sessions.

Primary key : reward_id (instance of reward given to the user)
Foreign key : user_id
Other fields : date_earned, reward_id

'reward_number' will link to the FK reward_id firebase database.
In firebase there should be an image/badge for the corresponding reward_number, and a reward_name.
'''

class Rewards (models.Model):
    reward_id = models.AutoField(primary_key=True) # Unique instance of the reward as PK
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Link to the user
    reward_number = models.IntegerField() # FK links to Firebase reward_id
    date_earned = models.DateTimeField(auto_now_add=True) # Adds the timestamp for when the reward was earned

    def __str__(self):
        return f"{self.user.username} - Reward {self.reward_number}"