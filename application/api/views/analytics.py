from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from api.models import SessionUser, User

from django.db import models

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """
    Get analytics for a specific user (by ID or username).
    If no user_identifier is given, return the logged-in user's data.
    """

    user = request.user

    # Calculate average study hours
    avg_study_hours = user.hours_studied / user.total_sessions if user.total_sessions > 0 else 0

    return Response({
        "streaks": user.streaks,
        "average_study_hours": round(avg_study_hours, 2)
    })