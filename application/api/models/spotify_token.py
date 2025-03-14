from django.db import models
from .user import User

class SpotifyToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='spotify_user')
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)

