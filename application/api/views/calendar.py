from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Appointments
from ..serializers import AppointmentSerializer
@api_view(['GET', 'POST'])
def create_appointment(request):
    if request.method == 'GET':
        # Fetch all appointments
        appointments = Appointments.objects.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Handle appointment creation
        serializer = AppointmentSerializer(data=request.data)  # DRF's request.data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)