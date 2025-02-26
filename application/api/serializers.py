from rest_framework import serializers
from .models import * 

class AppointmentSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name')
    start = serializers.DateTimeField(source='start_date')
    end = serializers.DateTimeField(source='end_date')
    classNames = serializers.CharField(source='status')

    class Meta: 
        model = events.Appointments
        fields = ('id','start','classNames', 'end','title')