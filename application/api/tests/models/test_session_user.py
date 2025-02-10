from django.test import TestCase
from django.utils.timezone import now
from datetime import timedelta
from api.models import User, StudySession, SessionUser

class StudySession:
    def __init__(self, session_name, created_by):
        self.session_name = session_name
        self.created_by = created_by

    def test_str_representation(self):
        """Test string representation in different states"""
        # Test default state
        expected = f"{self.user.username} - Casual - {self.session.session_name}"
        self.assertEqual(str(self.session_user), expected)
        
        # Test with focus target and different status
        self.session_user.focus_target = "Study Python"
        self.session_user.status = 'FOCUSED'
        self.session_user.save()
        expected = f"{self.user.username} - Focused - {self.session.session_name}"
        self.assertEqual(str(self.session_user), expected)

    def test_update_status_invalid(self):
        """Test invalid status update"""
        with self.assertRaises(ValueError):
            self.session_user.update_status('INVALID')

    def test_update_status_from_casual(self):
        """Test status update from casual to focused"""
        initial_time = now()
        self.session_user.last_status_change = initial_time
        self.session_user.status = 'CASUAL'
        
        self.session_user.update_status('FOCUSED')
        
        self.assertEqual(self.session_user.status, 'FOCUSED')
        self.assertGreater(self.session_user.last_status_change, initial_time)
        self.assertEqual(self.session_user.focus_time, timedelta(0))

    def test_update_status_from_focused(self):
        """Test status update from focused to casual with time tracking"""
        initial_time = now()
        self.session_user.last_status_change = initial_time - timedelta(hours=1)
        self.session_user.status = 'FOCUSED'
        
        self.session_user.update_status('CASUAL')
        
        self.assertEqual(self.session_user.status, 'CASUAL')
        self.assertGreater(self.session_user.focus_time, timedelta(minutes=59))

    def test_leave_session_from_casual(self):
        """Test leaving session from casual status"""
        initial_hours = self.user.hours_studied
        self.session_user.status = 'CASUAL'
        
        self.session_user.leave_session()
        
        with self.assertRaises(SessionUser.DoesNotExist):
            SessionUser.objects.get(pk=self.session_user.pk)
        self.assertEqual(self.user.hours_studied, initial_hours)

    def test_leave_session_from_focused(self):
        """Test leaving session from focused status"""
        initial_hours = self.user.hours_studied
        self.session_user.status = 'FOCUSED'
        self.session_user.last_status_change = now() - timedelta(hours=2)
        
        self.session_user.leave_session()
        
        with self.assertRaises(SessionUser.DoesNotExist):
            SessionUser.objects.get(pk=self.session_user.pk)
        self.user.refresh_from_db()
        self.assertEqual(self.user.hours_studied, initial_hours + 2)

    def test_update_focus_target(self):
        """Test focus target updates"""
        # Test valid update
        new_goal = "Study Python"
        self.session_user.update_focus_target(new_goal)
        self.assertEqual(self.session_user.focus_target, new_goal)
        
        # Test invalid updates
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("")
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("x" * 256)

    def test_rejoin_session_sequence(self):
        """Test session joining sequence"""
        # First join (from setUp)
        self.assertEqual(self.session_user.join_sequence, 1)
        
        # Leave and rejoin
        self.session_user.leave_session()
        session_user = SessionUser.rejoin_session(self.user, self.session)
        self.assertEqual(session_user.join_sequence, 2)
        
        # Third join
        session_user.leave_session()
        session_user = SessionUser.rejoin_session(self.user, self.session)
        self.assertEqual(session_user.join_sequence, 3)

    def test_focus_time_calculation(self):
        """Test precise focus time calculations"""
        # Test one hour focus period
        self.session_user.status = 'FOCUSED'
        self.session_user.last_status_change = now() - timedelta(hours=1)
        self.session_user.update_status('CASUAL')
        self.assertAlmostEqual(
            self.session_user.focus_time.total_seconds(),
            3600,  # One hour in seconds
            delta=1  # Allow 1 second difference
        )
        
        # Test accumulating multiple periods
        self.session_user.update_status('FOCUSED')
        self.session_user.last_status_change = now() - timedelta(hours=2)
        self.session_user.update_status('CASUAL')
        self.assertAlmostEqual(
            self.session_user.focus_time.total_seconds(),
            10800,  # Three hours total (1 + 2)
            delta=1
        )

    def test_concurrent_session_handling(self):
        """Test handling of concurrent sessions"""
        other_session = StudySession.objects.create(
            session_name='Other Session',
            created_by=self.user
        )
        
        # Set up existing session with focus time
        self.session_user.status = 'FOCUSED'
        self.session_user.last_status_change = now() - timedelta(hours=1)
        self.session_user.save()
        
        # Join new session while in existing one
        new_session = SessionUser.rejoin_session(self.user, other_session)
        
        # Verify old session was closed and time was logged
        with self.assertRaises(SessionUser.DoesNotExist):
            SessionUser.objects.get(pk=self.session_user.pk)
        
        self.user.refresh_from_db()
        self.assertGreater(self.user.hours_studied, 0)
        self.assertEqual(new_session.focus_time, timedelta(0))

    def test_meta_class_configuration(self):
        """Test Meta class configuration"""
        # Test ordering
        self.assertEqual(
            SessionUser._meta.ordering,
            ['session', 'joined_at']
        )

    def test_focus_time_edge_cases(self):
        """Test edge cases in focus time calculations"""
        # Test very short focus period
        self.session_user.status = 'FOCUSED'
        self.session_user.last_status_change = now() - timedelta(microseconds=100)
        self.session_user.update_status('CASUAL')
        self.assertLess(self.session_user.focus_time.total_seconds(), 1)
        
        # Test very long focus period
        self.session_user.status = 'FOCUSED'
        self.session_user.last_status_change = now() - timedelta(hours=25)
        self.session_user.update_status('CASUAL')
        self.assertGreater(self.session_user.focus_time.total_seconds(), 24*3600)

