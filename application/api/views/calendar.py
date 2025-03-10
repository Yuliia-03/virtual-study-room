# filepath: /c:/Users/prapt/OneDrive/Documents/UNI/SEG/MGP/virtual-study-room/application/api/views.py
from rest_framework import viewsets
from api.models.events import Appointments
from api.serializers import AppointmentSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Appointments.objects.all()
    serializer_class = AppointmentSerializer
    # No permission classes specified, allowing all access

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from api.models.events import Appointments
# from api.serializers import AppointmentSerializer

# @api_view(['GET'])
# def list_events(request):
#     events = Appointments.objects.all()
#     serializer = AppointmentSerializer(events, many=True)
#     return Response(serializer.data)
