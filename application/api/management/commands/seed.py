from django.core.management.base import BaseCommand, CommandError

from django.core.management import call_command
from api.models import Friends, User, Status

import pytz
from faker import Faker
from random import choice

'''
For a default users we can simply create a json file and upload the data (have a look on tests/fixtures) 
This data can be accessed and used for tests and seeder, which helps to avoid rewriting same code
If we have to use a faker, than simply add function and call in handle function after call_command()
'''

class Command(BaseCommand):

    FRIENDS_COUNT = 10
    USER_COUNT = 300
    DEFAULT_PASSWORD = "Password123"
    
    def __init__(self):
        super().__init__()
        self.faker = Faker('en_GB')

    def handle(self, *args, **kwargs):
        print("Starting database seeding...")

        try:
            call_command('loaddata', 'api/tests/fixtures/default_user.json')
            call_command('loaddata', 'api/tests/fixtures/default_friends.json')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))

        self.generating_users()
        print("Database seeded successfully!")
        
        #since we don't have a users seeder yet, I created a function, however I can't call it without creating users first
        self.generate_random_friends()

    def generate_random_friends(self):
        friends_count = Friends.objects.count()
        while friends_count < self.FRIENDS_COUNT:
            print(f"Seeding friend {friends_count}/{self.FRIENDS_COUNT}", end='\r')
            self.generate_friends()
            friends_count = Friends.objects.count()
        print("Friends seeding complete.")

    def generate_friends(self):
        users = User.objects.all()
        statuses = [c[0] for c in Status.choices]
        created_at = "2025-02-01T12:00:00Z"

        user1 = choice(users)
        user2 = choice(users)
        status = choice(statuses)

        if not user1 == user2 and not Friends.are_friends(user1, user2):
            self.create_friends({
                'user1': user1,
                'user2': user2,
                'status': status,
                'created_at': created_at
            })
    
    def create_friends(self, data):
        try:
            friends = Friends.objects.create(
                user1=data["user1"],
                user2=data["user2"],
                status=data["status"],
                created_at=data["created_at"]
            )
            return friends
        except:
            pass

    def generating_users(self):
        for x in range(self.USER_COUNT):
            print(f"Seeding user {x+1}/{self.USER_COUNT}", end='\r')
            self.generate_random_user()

    def try_create_user(self, data):
        try:
            self.create_student(data)
        except Exception as e:
            print(f"Failed to create user: {e}")

    def create_user(self, data):
        User.objects.create_user(firstname = data['firstName'], lastname = data['lastName'], email = data['email'], username = data['username'], password = DEFAULT_PASSWORD)

    def generate_random_user(self):
        firstName = self.faker.first_name()
        lastName = self.faker.last_name()
        email = self.create_email(firstName, lastName)
        username = self.create_username(firstName, lastName)

        self.try_create_user({'firstName': firstName, 'lastName' : lastName, 'email': email, 'username': username})


    # Helper functions
    def create_username(self, first_name, last_name):
        return '@' + first_name.lower() + last_name.lower()


    def create_email(self, first_name, last_name):
        return first_name.lower() + '.' + last_name.lower() + '@example.org'