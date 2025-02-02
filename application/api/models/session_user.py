from django.db import models

class SessionUser(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='sessions')
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(null=True, blank=True)
    room = models.ForeignKey('Room', on_delete=models.CASCADE, related_name='session_users')
    is_active = models.BooleanField(default=True)
    pomodoro_count = models.IntegerField(default=0)
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

    class Meta:
        ordering = ['-session_start']

    def end_session(self):
        from django.utils import timezone
        self.session_end = timezone.now()
        self.is_active = False
        self.save()

    def increment_pomodoro(self):
        self.pomodoro_count += 1
        self.save()

    def update_status(self, new_status):
        self.status = new_status
        self.save()
