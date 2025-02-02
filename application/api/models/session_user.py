from django.db import models

class SessionUser(models.Model):
    user_id = models.ForeignKey('auth.User', on_delete=models.CASCADE, primary_key=True)
    session_id = models.ForeignKey('StudySession', on_delete=models.CASCADE, primary_key=True)
    # these are extra fields, can adjust/ discuss later
    is_active = models.BooleanField(default=True)
    total_focus_time = models.DurationField(default=0)
    status = models.CharField(
        max_length=20,
        choices=[
            ('STUDYING', 'Studying'),
            ('ON_BREAK', 'On Break'),
            ('IDLE', 'Idle')
        ],
        default='STUDYING'
    )
    session_goal = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-session_id']

    # can be adjusted
    def update_status(self, new_status):
        self.status = new_status
        self.save()
