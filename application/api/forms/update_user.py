
from django import forms

from api.models import User


class UserForm(forms.ModelForm):
    """Form to update user profiles."""

    class Meta:
        """Form options."""
        model = User
        fields = ['firstname', 'lastname', 'email', 'username']
        widgets = {
            'firstname': forms.TextInput(attrs={'class': 'form-control'}),
            'lastname': forms.TextInput(attrs={'class': 'form-control'}),
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'})
        }
        error_messages = {
            'username': {
                'unique': "This username already exists. Please use a different one.",
            },
            'email': {
                'unique': "This email is already in use. Please use a different one.",
            }
        }