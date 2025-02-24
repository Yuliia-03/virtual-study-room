from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser

'''
Custom User Model & Manager. Extends AbstractBaseUser to create custom User model

Primary key     :   user_id (Auto-incremented)
Required fields :   firstname, lastname, email, username, password

WHEN USING: 
    -   settings.AUTH_USER_MODEL for models OR
    -   from django.contrib.auth import get_user_model
        User = get_user_model() for views, forms ...
'''

class UserManager(BaseUserManager):

      #"""
      #Custom User Manager to handle user creation
      #"""

    def create_user(self, email, firstname, lastname, username, password, **extra_fields):
        """
        Create and save a user
        """
        if not email:
            raise ValueError(("The Email must be set"))
        if not username:
            raise ValueError("Users must have a username")
        if not firstname:
            raise ValueError("Firstname must be set")
        if not lastname:
            raise ValueError("Lastname must be set")
        if not password:
            raise ValueError("Password must be set")
        
        email = self.normalize_email(email) #Normalises email by lowercasing the domain part
        user = self.model(email=email, username=username, firstname=firstname, lastname=lastname, **extra_fields)
        user.set_password(password)         #Automatically hashes password before saving
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firstname, lastname, username, password=None, **extra_fields):
        """
        Create and save a superuser
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, firstname, lastname, username, password, **extra_fields)

class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    email = models.EmailField(max_length=100, unique=True)
    username = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    hours_studied = models.IntegerField(default=0)
    streaks = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)   #Allows users to be disabled if needed
    is_staff = models.BooleanField(default=False)   # Required for admin access
    is_superuser = models.BooleanField(default=False)  # Required for superuser privileges
    
    objects = UserManager()     #Uses UserManager as custom manager

    USERNAME_FIELD = 'email'    #Uses email instead of username for authentication i.e. for login
    REQUIRED_FIELDS = ['firstname', 'lastname', 'username']

    def __str__(self):
        return self.username
    
    # Required methods for admin and permissions
    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return True

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return True