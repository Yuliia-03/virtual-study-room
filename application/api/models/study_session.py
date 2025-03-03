from django.db import models
import datetime
from .user import User
from django.utils.timezone import now

# model for the study session (can be group or individual)
class StudySession(models.Model):

    # user that creates the study session
    createdBy = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'study_session')
    sessionName = models.CharField(max_length=255, blank=False)
    # Aamukta - auto generated Study Session ID will be used as the room code
    startTime = models.TimeField(default=now)
    endTime = models.TimeField()
    date = models.DateField(default=datetime.date.today)

    def __str__(self):
        return f"Study session {self.sessionName} was created by {self.createdBy} on {self.date}. It was initiated at {self.startTime} and terminated at {self.endTime}"



