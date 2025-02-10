
from django import forms
from django.core.exceptions import ValidationError

from api.forms.password import NewPasswordMixin
from api.models import User


class SignUpForm(NewPasswordMixin, forms.ModelForm):
    """Form enabling unregistered users to sign up."""

    class Meta:
        """Form options."""
        model = User

        fields = ['firstname', 'lastname', 'email', 'username', 'email']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("This email is already in use.")
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise ValidationError("This username is already in use.")
        return username

    def save(self):
        """Create a new user."""

        user = User(
            username=self.cleaned_data['username'],
            email=self.cleaned_data['email'],
            firstname=self.cleaned_data['firstname'],
            lastname=self.cleaned_data['lastname']
        )
        user.set_password(self.cleaned_data['new_password'])
        user.save()

        return user