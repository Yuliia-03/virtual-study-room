
from rest_framework import viewsets, permissions
from ..serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models.events import *

class Calendar(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def list(self, request):
        queryset = Event.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
