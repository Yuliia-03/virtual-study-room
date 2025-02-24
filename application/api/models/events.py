import datetime
from django.db import models
from .user import User
from django.utils.timezone import now

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=500, blank=True, null=True)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True,)
    #location = models.CharField(max_length=255, blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True )

    def __str__(self):
        return self.title

