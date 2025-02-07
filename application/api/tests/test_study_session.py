"""Unit tests for the StudySession model."""
from django.test import TestCase
from api.models import StudySession, User
from datetime import datetime, time, date

class StudySessionTestCase(TestCase):
    """Unit tests for the StudySession model."""
    def setUp(self):
        self.user = User.objects.create(firstname = "John", lastname = "Doe", email = "johndoe@example.com", username = "@johndoe")
        self.sessionName = "Test Session"
        self.startTime = datetime.now().time()
        self.endTime = time(14, 30)
        self.date = date.today()
        self.session = StudySession.objects.create(createdBy = self.user, sessionName = self.sessionName, startTime = self.startTime, endTime = self.endTime)

    def test_study_session_creation(self):
        # testing if the instantce of a study session is created correctly
        self.assertEqual(StudySession.objects.count(), 1)
        self.assertEqual(self.session.createdBy.firstname , "John")
        self.assertEqual(self.session.sessionName, "Test Session")
        self.assertEqual(self.session.endTime, self.endTime)
        self._assert_session_is_valid()

    def test_study_session_str_method(self):
        # checking if the __str__ method works
        expected_str = f"Study session {self.sessionName} was created by {self.user} on {self.date}. It was initiated at {self.startTime} and terminated at {self.endTime}"
        self.assertEqual(str(self.session), expected_str)


    def _assert_session_is_valid(self):
        try:
            self.session.full_clean()
        except (ValidationError):
            self.fail('Test session should be valid')

    def _assert_session_is_invalid(self):
        with self.assertRaises(ValidationError):
            self.session.full_clean()

