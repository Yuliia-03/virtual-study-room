from django.core.management.base import BaseCommand, CommandError

from django.core.management import call_command
from api.models import Friends, User, Status

import pytz
#from faker import Faker
from random import choice

'''
For a default users we can simply create a json file and upload the data (have a look on tests/fixtures) 
This data can be accessed and used for tests and seeder, which helps to avoid rewriting same code
If we have to use a faker, than simply add function and call in handle function after call_command()
'''

class Command(BaseCommand):

    FRIENDS_COUNT = 10
    
    def handle(self, *args, **kwargs):
        print("Starting database seeding...")

        try:
            call_command('loaddata', 'api/tests/fixtures/default_user.json')
            call_command('loaddata', 'api/tests/fixtures/default_friends.json')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))
        
        #since we don't have a users seeder yet, I created a function, however I can't call it without creating users first
        #self.generate_random_lessons()

    def generate_random_friends(self):
        friends_count = Friends.objects.count()
        while lesson_count < self.FRIENDS_COUNT:
            print(f"Seeding lesson {friends_count}/{self.FRIENDS_COUNT}", end='\r')
            self.generate_lesson()
            lesson_count = Friends.objects.count()
        print("Friends seeding complete.")

    def generate_friends(self):
        users = User.objects.all()
        statuses = [c[0] for c in Status.choices]
        created_at = "2025-02-01T12:00:00Z"

        user1 = choice(users)
        user2 = choice(users)
        status = choice(statuses)

        if not user1 == user2 and not Friends.are_friends(user1, user2):
            self.create_lesson({
                'user1': user1,
                'user2': user2,
                'status': status,
                'created_at': created_at
            })