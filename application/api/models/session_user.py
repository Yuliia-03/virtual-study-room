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
    # Some extra fields
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
    # When the user joined and left the session
    joined_at = models.DateTimeField(default=now)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Sort by newest sessions and joins first
        ordering = ['session', 'joined_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()} - {self.session.sessionName}"

    def update_status(self, new_status):
        """
        Update user's status and track-focused study time.
        If user was in FOCUSED status, adds the elapsed time
        to their total focus time before changing status.
        """
        if new_status not in dict(self.status.choices).keys():
            raise ValueError("Invalid status")
            
        current_time = now()
        time_diff = current_time - self.last_status_change
        
        if self.status == 'FOCUSED':
            self.focus_time += time_diff
            
        self.status = new_status
        self.last_status_change = current_time
        self.last_active = current_time
        self.save()

    def leave_session(self):
        """
        Calculate total session time, update user's study statistics, and remove session entry.
        """
        # Calculate total session time
        if self.left_at is None:
            self.left_at = now()

        session_duration = self.left_at - self.joined_at
        hours_studied = session_duration.total_seconds() / 3600  # Convert to hours

        # Update user's total study statistics
        if hours_studied > 0:
            self.user.hours_studied += int(hours_studied)
            self.user.total_sessions += 1  # Increment total sessions
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

