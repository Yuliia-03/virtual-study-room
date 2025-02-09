from django.core.management.base import BaseCommand
from models.motivational_message import MotivationalMessage

class Command(BaseCommand):
    help = "Remove all seeded motivational messages from the database"

    def handle(self, *args, **kwargs):
        deleted_count, _ = MotivationalMessage.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {deleted_count} motivational messages.'))
