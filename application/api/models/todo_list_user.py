from django.db import modelfrom 
from django.db import models
# from django.crontrib.auth.models import User


class List(models.Model):
    name = models.CharField(max_length=255)  # Example field

class Permission(models.Model):
    READ = 'read'
    WRITE = 'write'

    PERMISSION_TYPE_CHOICES = [
        (READ, 'Read'),
        (WRITE, 'Write'),
    ]

    user_id = models.ForeignKey(#User, on_delete=models.CASCADE)  # Links to User
    list_id = models.ForeignKey(List, on_delete=models.CASCADE)  # Links to List
    permission_type = models.CharField(max_length=10, choices=PERMISSION_TYPE_CHOICES)

     class Meta:
        unique_together = ('user', 'list')  # Ensures a user can't have duplicate permissions for the same list

    def __str__(self):
        return f"{self.user_id.username} - {self.list_id.name} - {self.permission_type}"