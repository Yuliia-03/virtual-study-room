from django.db import models
from django.utils.timezone import now
import datetime
from .user import User
from .study_session import StudySession

class SessionUser(models.Model):
    """
    Represents a user's participation in a study session, tracking a range of session-specific information.
    """
    # Foreign keys
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_users')
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='session_users')
    # Track which join this is (first join = 1, second = 2, etc.)
    join_sequence = models.PositiveIntegerField(default=1)
    # Current status in the session - determines availability and focus state
    status = models.CharField(
        max_length=20,
        choices=[
            ('FOCUSED', 'Focused'),      # Actively studying, no distractions
            ('CASUAL', 'Casual'),        # In study session but open to interaction
        ],
        default='CASUAL'
    )
    # What specific thing the user is currently working on
    focus_target = models.CharField(max_length=255, null=True, blank=True)
    # Session timing
    joined_at = models.DateTimeField(default=now)
    left_at = models.DateTimeField(null=True, blank=True)
    # All the time spent in FOCUSED status during the session
    focus_time = models.DurationField(default=datetime.timedelta(0))

    class Meta:
        # Sort by newest sessions and joins first
        ordering = ['session', 'joined_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()} - {self.session.sessionName}"

    def update_status(self, new_status):
        """
        Update user's status and track focused study time.
        If user was in FOCUSED status, adds the elapsed time
        to their total focus time before changing status.
        """
        valid_statuses = ['FOCUSED', 'CASUAL']
        if new_status not in valid_statuses:
            raise ValueError("Invalid status")
            
        current_time = now()
        
        if self.status == 'FOCUSED':
            time_diff = current_time - self.joined_at
            self.focus_time += time_diff
            
        self.status = new_status
        self.save()

    def leave_session(self):
        """
        Calculate final focus time, update user's study statistics, and remove session entry.
        """
        # Calculate final focus time
        if self.status == 'FOCUSED':
            final_time = now() - self.joined_at
            self.focus_time += final_time
        
        # Set left_at time
        self.left_at = now()
        self.save()
        
        # Update user's total study statistics
        if self.focus_time.total_seconds() > 0:
            hours_studied = self.focus_time.total_seconds() / 3600
            self.user.hours_studied += int(hours_studied)
            self.user.save()
        
        # Delete the session user entry
        self.delete()

    def update_focus_target(self, new_goal):
        """
        Update the user's focus target for this study session. 
        """
        if not new_goal or len(new_goal) > 255:
            raise ValueError("Goal shouldn't be empty and must have 255 characters or less!")
        self.focus_target = new_goal
        self.save()

    @classmethod
    def rejoin_session(cls, user, session):
        """
        Creates a new SessionUser entry for a user rejoining a session.
        First ensures any existing session entry is properly closed out.
        Increments the join_sequence field based on previous joins.
        """
        # Check for and handle ANY existing active sessions for this user
        existing_sessions = cls.objects.filter(
            user=user,
            left_at__isnull=True  # Only get active sessions
        )
        
        for existing_session in existing_sessions:
            existing_session.leave_session()
        
        # Get the highest join sequence for this user in this session
        # Include historical (deleted) sessions in the count
        from django.db.models import Max
        last_sequence = cls.objects.filter(
            user=user,
            session=session
        ).aggregate(Max('join_sequence'))['join_sequence__max'] or 0
        
        return cls.objects.create(
            user=user,
            session=session,
            join_sequence=last_sequence + 1
        )

