from django.core.management.base import BaseCommand, CommandError
from api.models import *


class Command(BaseCommand):
    """Build automation command to unseed the database."""

    help = 'Unseeds the database by removing all sample data'

    def handle(self, *args, **options):
        """Unseed the database."""
        print("Starting database unseeding...")

        # Delete in order to respect foreign key constraints
        

        print("Deleting friends...")
        Friends.objects.all().delete()

        print("Deleting users...")
        User.objects.all().delete()

        print("Deleting To Do List Items")
        toDoList.objects.all().delete()