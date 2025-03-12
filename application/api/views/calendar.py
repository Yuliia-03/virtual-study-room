# filepath: /c:/Users/prapt/OneDrive/Documents/UNI/SEG/MGP/virtual-study-room/application/api/views.py

from rest_framework import viewsets, permissions
from api.models.events import Appointments
from api.serializers import AppointmentSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter events by the currently authenticated user
        return Appointments.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user to the currently authenticated user
        serializer.save(user=self.request.user)