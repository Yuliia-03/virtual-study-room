from rest_framework import serializers
from .models import Appointments

class AppointmentSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name')  # Maps title → name
    start = serializers.DateTimeField(source='start_date')  # Maps start → start_date
    end = serializers.DateTimeField(source='end_date')  # Maps end → end_date
    description = serializers.CharField(source='comments', required=False)  # Maps description → comments

    class Meta:
        model = Appointments
        fields = ['title', 'start', 'end', 'description', 'status']  # Add status

    def create(self, validated_data):
        # Ensure 'status' is included (temporary default if missing)
        if 'status' not in validated_data:
            validated_data['status'] = 'Pending'  
        return Appointments.objects.create(**validated_data)
