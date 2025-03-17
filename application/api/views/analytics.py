from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from rest_framework import status
from api.models import SessionUser, User, Rewards

from django.db import models

@api_view(['GET'])
@permission_classes([IsAuthenticated])

def get_analytics(request):
    user = request.user

    # Debug: Print user data
    print(f"User: {user.username}")
    print(f"Hours Studied: {user.hours_studied}")
    print(f"Total Sessions: {user.total_sessions}")
    print(f"Streaks: {user.streaks}")

    # Calculate average study hours
    avg_study_hours = user.hours_studied / user.total_sessions if user.total_sessions > 0 else 0

    # Define badge thresholds
    badge_thresholds = {
        1: 1,    # Badge 1 for 1 hour
        2: 5,    # Badge 2 for 5 hours
        3: 15,   # Badge 3 for 15 hours
        4: 30,   # Badge 4 for 30 hours
        5: 50,   # Badge 5 for 50 hours
        6: 75,   # Badge 6 for 75 hours
        7: 100,  # Badge 7 for 100 hours
        8: 150,  # Badge 8 for 150 hours
    }

    # Calculate earned badges
    earned_badges = []
    for reward_number, threshold in badge_thresholds.items():
        if user.hours_studied >= threshold:
            # Check if the user has already earned this badge
            reward, created = Rewards.objects.get_or_create(
                user=user,
                reward_number=reward_number,
                defaults={"date_earned": timezone.now()}  # Set date_earned only if the badge is newly created
            )
            earned_badges.append({
                "reward_number": reward.reward_number,
                "date_earned": reward.date_earned.strftime("%Y-%m-%d")
            })
            print(f"Existing badge: {reward_number}")  # Debug: Log existing badge

    # Debug: Print earned badges
    print(f"Earned Badges: {earned_badges}")

    return Response({
        "streaks": user.streaks,
        "total_hours_studied": user.hours_studied,
        "is_sharable": user.share_analytics,
        "average_study_hours": round(avg_study_hours, 2),
        "earned_badges": earned_badges
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_analytics(request):

    user = request.user
    new_status = not user.share_analytics

    user.share_analytics = new_status
    user.save()
    
    return Response({"message": "Joined successfully!"}, status=status.HTTP_200_OK)

    