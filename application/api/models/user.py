from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db.models import Q

'''
Custom User Model & Manager. Extends AbstractBaseUser to create custom User model

Primary key     :   user_id (Auto-incremented)
Required fields :   firstname, lastname, email, username, password, description

WHEN USING: 
    -   settings.AUTH_USER_MODEL for models OR
    -   from django.contrib.auth import get_user_model
        User = get_user_model() for views, forms ...
'''

class UserManager(BaseUserManager):
      """
      Custom User Manager to handle user creation
      """
      def create_user(self, email, firstname, lastname, username, password, description, **extra_fields):
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
            user = self.model(email=email, username=username, firstname=firstname, lastname=lastname, description=description, **extra_fields)
            user.set_password(password)         #Automatically hashes password before saving
            user.save(using=self._db)
            return user
    

class User(AbstractBaseUser, PermissionsMixin):
    #user_id = models.AutoField(primary_key=True)
    firstname = models.CharField(max_length=50, blank=False)
    lastname = models.CharField(max_length=50, blank=False)
    email = models.EmailField(max_length=100, unique=True, blank=False)
    username = models.CharField(max_length=30,
        unique=True,
        validators=[RegexValidator(
            regex=r'^@\w{3,}$',
            message='Username must consist of @ followed by at least three alphanumericals'
        )])
    created_at = models.DateTimeField(auto_now_add=True)
    hours_studied = models.IntegerField(default=0)
    streaks = models.IntegerField(default=0)
    share_analytics = models.BooleanField(default=False)
    description = models.TextField(blank=True, default="")  #Text field that can be blank
    total_sessions = models.IntegerField(default=0)
    #profile_id = models.CharField(max_length=255, blank=True, null=True)  #For Firebase storage reference for image - if still needed


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

    def full_name(self):
        """Return a string containing the user's full name."""

        return f'{self.firstname} {self.lastname}'

    @staticmethod
    def find_user(search_query):
        return User.objects.filter(
            Q(username__icontains=search_query) |
            Q(firstname__icontains=search_query) |
            Q(lastname__icontains=search_query))
        
