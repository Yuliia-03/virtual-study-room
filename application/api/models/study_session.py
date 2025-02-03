from django.db import models
import datetime
from .user import User
from django.utils.timezone import now

# model for the study session (can be group or individual)
class StudySession(models.Model):

    createdBy = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'study_session')
    sessionName = models.CharField(max_length=255, blank=False)
    startTime = models.DateTimeField(default=now)
    endTime = models.DateTimeField()
    date = models.DateField(default=datetime.date.today)

    def __str__(self):
        return f"Study session {sessionName} was created by {createdBy} on {date}. It was initiated at {startTime} and terminated at {endTime}"



