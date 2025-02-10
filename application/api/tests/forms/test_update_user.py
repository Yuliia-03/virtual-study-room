"""Unit tests of the user form."""
from django import forms
from django.test import TestCase
from api.forms import UserForm
from api.models import User

class UserFormTestCase(TestCase):
    """Unit tests of the user form."""

    fixtures = [
        'api/tests/fixtures/default_user.json'
    ]

    def setUp(self):
        self.form_input = {
            'firstname': 'Jane',
            'lastname': 'Doe',
            'username': 'janedoe',
            'email': 'janedoe@example.org',
            "created_at": "2025-01-01T12:00:00Z"
        }

    def test_form_has_necessary_fields(self):
        form = UserForm()
        self.assertIn('firstname', form.fields)
        self.assertIn('lastname', form.fields)
        self.assertIn('username', form.fields)
        self.assertIn('email', form.fields)
        email_field = form.fields['email']
        self.assertTrue(isinstance(email_field, forms.EmailField))

    def test_valid_user_form(self):
        form = UserForm(data=self.form_input)
        self.assertTrue(form.is_valid())

    def test_form_uses_model_validation(self):
        self.form_input['email'] = 'bademail'
        form = UserForm(data=self.form_input)
        self.assertFalse(form.is_valid())

    def test_form_must_save_correctly(self):
        user = User.objects.get(username='john789')
        form = UserForm(instance=user, data=self.form_input)
        before_count = User.objects.count()
        form.save()
        after_count = User.objects.count()
        self.assertEqual(after_count, before_count)
        self.assertEqual(user.username, 'janedoe')
        self.assertEqual(user.firstname, 'Jane')
        self.assertEqual(user.lastname, 'Doe')
        self.assertEqual(user.email, 'janedoe@example.org')
