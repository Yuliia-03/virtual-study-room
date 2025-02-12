import logging
logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler()])
from django.core.management.base import BaseCommand, CommandError

from django.core.management import call_command
from api.models import Friends, User, Status, toDoList

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
    TODOLIST_COUNT = 20
    
    def handle(self, *args, **kwargs):
        print("Starting database seeding...")

        try:
            call_command('loaddata', 'api/tests/fixtures/default_user.json')
            call_command('loaddata', 'api/tests/fixtures/default_friends.json')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))
        
        #since we don't have a users seeder yet, I created a function, however I can't call it without creating users first
        #self.generate_random_friendss()
        self.generate_random_toDoLists()


    def generate_random_friends(self):
        friends_count = Friends.objects.count()
        while friends_count < self.FRIENDS_COUNT:
            print(f"Seeding friends {friends_count}/{self.FRIENDS_COUNT}", end='\r')
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

    def generate_random_toDoLists(self):
        toDoList_count = toDoList.objects.count()
        print(f"Initial ToDoList count: {toDoList_count}, Target: {self.TODOLIST_COUNT}")

        while toDoList_count < self.TODOLIST_COUNT:
            print(f"Seeding ToDoLists {toDoList_count}/{self.TODOLIST_COUNT}")
            self.generate_toDoLists()
            toDoList_count = toDoList.objects.count()
        
        print(f"Final ToDoList count: {toDoList_count}, Target: {self.TODOLIST_COUNT}")
        print("ToDoList seeding complete.")

    def generate_toDoLists(self):
        titles = ['Finish cw1', 'catch with with week 2', 'Project Task: create a database']
        contents = ['complete week 2 and week3', 'ask TA for help', 'clone github repo', 'understand travelling salesman problem', '']

        title = choice(titles)
        content = choice(contents)
        is_completed = choice([True, False])
        is_shared = choice([True, False])

        self.create_toDoLists({
            'title':title,
            'content':content,
            'is_completed':is_completed,
            'is_shared': is_shared
        })


    def create_toDoLists(self, data):
        try:
            toDoLists = toDoList.objects.create(
                title = data["title"],
                content = data["content"],
                is_completed = data["is_completed"],
                is_shared = data["is_shared"]
            )
            return toDoLists
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating ToDoList: {str(e)}'))

        
        
        

    