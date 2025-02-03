from django.db import models
from django.contrib.auth.base_user import BaseUserManager

class UserManager(BaseUserManager):
      def create_user(self, email, firstname, lastname, username, password=None, **extra_fields):
            if not email:
                  raise ValueError(_("The Email must be set"))
            email = self.normalize_email(email)
            user = self.model(email=email, username=username, **extra_fields)

class User (model
            s.Model):
    user_id = models.AutoField(primary_key=True)



    user_id			INT PRIMARY KEY AUTO_INCREMENT,
firstname		VARCHAR(50),
	lastname		VARCHAR(50),
	email			VARCHAR(100) UNIQUE NOT NULL,
	username		VARCHAR(50) UNIQUE NOT NULL,
	password		VARCHAR(255) NOT NULL,	– Store hashed passwords
	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	hours studied?		?
	streaks			type?
