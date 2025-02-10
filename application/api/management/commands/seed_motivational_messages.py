from django.core.management.base import BaseCommand
from models.motivational_message import MotivationalMessage

class Command(BaseCommand):
    help = "Seed the database with motivational messages"

    def handle(self, *args, **kwargs):
        messages = [
            "Believe in yourself and all that you are.",
            "Hard work beats talent when talent doesn’t work hard.",
            "You are capable of more than you know.",
            "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            "Don't watch the clock; do what it does. Keep going.",
            "Difficulties in life are intended to make us better, not bitter.",
            "You don’t have to be great to start, but you have to start to be great.",
        ]

        for msg in messages:
            MotivationalMessage.objects.get_or_create(text=msg)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(messages)} motivational messages.'))
