# filepath: /c:/Users/prapt/OneDrive/Documents/UNI/SEG/MGP/virtual-study-room/application/api/views.py

from rest_framework import viewsets, permissions
from api.models.events import Appointments
from api.serializers import AppointmentSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Appointments.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require authentication
