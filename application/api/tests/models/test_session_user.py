from django.test import TestCase
from django.utils.timezone import now
from datetime import timedelta, time
from api.models import User, StudySession, SessionUser
from django.db import connection
from django.test.utils import CaptureQueriesContext

class SessionUserTest(TestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create(username='testuser', hours_studied=0)
        self.session = StudySession.objects.create(
            createdBy=self.user,
            sessionName='Test Session',
            endTime=time(hour=23, minute=59)  # Required field
        )
        self.session_user = SessionUser.objects.create(
            user=self.user,
            session=self.session
        )

    def test_str_representation(self):
        """Test string representation"""
        expected = f"{self.user.username} - {self.session_user.get_status_display()} - {self.session.sessionName}"
        self.assertEqual(str(self.session_user), expected)

    def test_update_status_invalid(self):
        """Test invalid status update"""
        with self.assertRaises(ValueError):
            self.session_user.update_status('INVALID')

    def test_update_status_from_casual(self):
        """Test status update from casual to focused"""
        initial_time = now()
        self.session_user.status = 'CASUAL'
        self.session_user.joined_at = initial_time
        
        self.session_user.update_status('FOCUSED')
        
        self.assertEqual(self.session_user.status, 'FOCUSED')
        self.assertEqual(self.session_user.focus_time, timedelta(0))

    def test_update_status_from_focused(self):
        """Test status update from focused to casual with time tracking"""
        initial_time = now()
        self.session_user.joined_at = initial_time - timedelta(hours=1)
        self.session_user.status = 'FOCUSED'
        
        self.session_user.update_status('CASUAL')
        
        self.assertEqual(self.session_user.status, 'CASUAL')
        self.assertGreater(self.session_user.focus_time, timedelta(minutes=59))

    def test_leave_session_from_casual(self):
        """Test leaving session from casual status"""
        initial_hours = self.user.hours_studied
        self.session_user.status = 'CASUAL'
        
        self.session_user.leave_session()
        
        # Instead of checking for deletion, verify left_at is set
        session_user = SessionUser.objects.get(pk=self.session_user.pk)
        self.assertIsNotNone(session_user.left_at)
        self.assertEqual(self.user.hours_studied, initial_hours)

    def test_leave_session_from_focused(self):
        """Test leaving session from focused status"""
        initial_hours = self.user.hours_studied
        self.session_user.status = 'FOCUSED'
        self.session_user.joined_at = now() - timedelta(hours=2)
        
        self.session_user.leave_session()
        
        # Instead of checking for deletion, verify left_at is set
        session_user = SessionUser.objects.get(pk=self.session_user.pk)
        self.assertIsNotNone(session_user.left_at)
        self.user.refresh_from_db()
        self.assertEqual(self.user.hours_studied, initial_hours + 2)

    def test_update_focus_target(self):
        """Test focus target updates"""
        new_goal = "Study Python"
        self.session_user.update_focus_target(new_goal)
        self.assertEqual(self.session_user.focus_target, new_goal)  # Changed from focusTarget
        
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("")
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("x" * 256)

    def test_rejoin_session_sequence(self):
        """Test session joining sequence"""
        # First join - already created in setUp
        print(f"\nInitial session sequence: {self.session_user.join_sequence}")
        self.assertEqual(self.session_user.join_sequence, 1)
        
        # Store session info before leaving
        session = self.session_user.session
        user = self.session_user.user
        
        # Print all SessionUser objects before leaving
        print("\nBefore leaving:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}: sequence={su.join_sequence}")
        
        # Leave first session
        self.session_user.leave_session()
        
        # Verify deletion
        print("\nAfter leaving:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}: sequence={su.join_sequence}")
        
        # Second join - with query logging
        with CaptureQueriesContext(connection) as queries:
            second_session = SessionUser.rejoin_session(user, session)
            print("\nQueries executed during rejoin:")
            for query in queries.captured_queries:
                print(query['sql'])
        
        print(f"\nSecond session sequence: {second_session.join_sequence}")
        self.assertEqual(second_session.join_sequence, 2)
        
        # Print all SessionUser objects after second join
        print("\nAfter second join:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}: sequence={su.join_sequence}")
        
        # Leave second session
        second_session.leave_session()
        
        # Third join
        third_session = SessionUser.rejoin_session(user, session)
        print(f"\nThird session sequence: {third_session.join_sequence}")
        self.assertEqual(third_session.join_sequence, 3)
        
        # Final state
        print("\nFinal state:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}: sequence={su.join_sequence}")

    def test_concurrent_session_handling(self):
        """Test handling of concurrent sessions"""
        other_session = StudySession.objects.create(
            sessionName='Other Session',
            createdBy=self.user,
            endTime=time(hour=23, minute=59)
        )
        
        self.session_user.status = 'FOCUSED'
        self.session_user.joined_at = now() - timedelta(hours=1)
        self.session_user.save()
        
        new_session = SessionUser.rejoin_session(self.user, other_session)
        
        # Instead of checking for deletion, verify left_at is set
        old_session = SessionUser.objects.get(pk=self.session_user.pk)
        self.assertIsNotNone(old_session.left_at)
        
        self.user.refresh_from_db()
        self.assertGreater(self.user.hours_studied, 0)
        self.assertEqual(new_session.focus_time, timedelta(0))

    def test_meta_ordering(self):
        """Test that sessions are ordered correctly"""
        other_user = SessionUser.objects.create(
            user=self.user,
            session=self.session,
            joined_at=now() + timedelta(hours=1)  # Changed from joinedAt
        )
        
        sessions = SessionUser.objects.all()
        
        self.assertEqual(sessions[0], self.session_user)
        self.assertEqual(sessions[1], other_user)

    def test_update_focus_target_edge_cases(self):
        """Test edge cases for focus target updates"""
        # Test empty string
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("")
        
        # Test None
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target(None)
        
        # Test too long string
        with self.assertRaises(ValueError):
            self.session_user.update_focus_target("x" * 256)

