from django.contrib.auth.mixins import LoginRequiredMixin
from api.models import List, toDoList, Permission
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views import View
from rest_framework.permissions import IsAuthenticated

class ViewToDoList(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, is_shared="false"):
        user = request.user
        is_shared_bool = is_shared.lower() == "true"

        user_permissions = Permission.objects.filter(user_id=user)
        user_lists = List.objects.filter(
            id__in=user_permissions.values_list('list_id', flat=True),
             is_shared=is_shared_bool
             )

        
        response_data = []
        for todo_list in user_lists:
            # Fetch related tasks manually
            tasks = toDoList.objects.filter(list=todo_list)


            response_data.append({
                "id": todo_list.id,
                "name": todo_list.name,
                "is_shared": todo_list.is_shared,
                "tasks": [
                    {
                        "id": task.id,
                        "title": task.title,
                        "content": task.content,
                        "is_completed": task.is_completed,
                    }
                    for task in tasks
                ]
            })

        return Response(response_data, status=status.HTTP_200_OK)
    
    def post(self, request):
        # Define the action type in request body
        action = request.data.get("action")

        if action == "create_new_task":
            self.create_task()
        elif action == "create_new_list":
            pass


    def create_task(self, request):
        try:
            data = request.data
            title = data.get("taskTitle")
            list_id = data.get("list_id")
            content = data.get("taskContent")

            if List.objects.filter(pk=list_id).exists():
                list = List.objects.get(pk=list_id)
                task = toDoList.objects.create(
                    title=title, content=content, list=list)
            else:
                return Response({"error": "List doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Task added successfully!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, task_id):
        print(f"Received PATCH request for task_id: {task_id}")
        task = toDoList.objects.get(id=task_id)  # Get the task by its ID
        # Only update fields provided
        if task:
            new_task_status = not task.is_completed
            toDoList.objects.filter(id=task_id).update(is_completed=new_task_status)
            return Response(status=status.HTTP_200_OK)
        return Response('Task not found', status=status.HTTP_400_BAD_REQUEST)
