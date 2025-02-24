from django.contrib import admin

# Register your models here.
from .models.events import Event

admin.site.register(Event)