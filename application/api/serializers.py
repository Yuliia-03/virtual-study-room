from rest_framework.serializers import ModelSerializer
from .models.events import Event
from rest_framework import serializers


class EventSerializer(serializers.ModelSerializer):
    # title = serializers.CharField(source='title')
    # start = serializers.DateField(source='start_time')
    # end = serializers.DateField(source='end_time')
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'user']