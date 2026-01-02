from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import TaskCommit
from .serializers import *
from task.models import Task
from project.models import Project
# views.py
class TaskInitializeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response({"error": "project_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        task_commits = TaskCommit.objects.filter(project_id=project_id)
        serializer = TaskCommitListSerializer(task_commits, many=True)  # ✅ List serializer
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response({"error": "project_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(pk=project_id)
        except project.DoesNotExist:
            return Response({"error": "Invalid project_id"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskCommitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project_id=project, completed_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def acceptcommit(request):
    commit_id = request.query_params.get("commit_id")
    if not commit_id:
        return Response({"error": "commit_id required"}, status=status.HTTP_400_BAD_REQUEST)
    
    task_commit = get_object_or_404(TaskCommit, commit_id=commit_id)
    
    # ✅ Safely get task
    if not task_commit.github_task:
        return Response({"error": "No associated GitHub task found"}, status=status.HTTP_400_BAD_REQUEST)
    
    task_id = task_commit.github_task.id
    task = get_object_or_404(Task, id=task_id)
    
    task.delete()
    task_commit.is_successful = True
    task_commit.save()
    
    return Response({"message": "Commit accepted and task deleted."}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def denycommit(request):
    commit_id = request.query_params.get("commit_id")  # Fix typo
    task_commit = get_object_or_404(TaskCommit, commit_id=commit_id)
    task_id = task_commit.github_task.id if hasattr(task_commit.github_task, 'id') else task_commit.github_task
    task = get_object_or_404(Task, id=task_id)  # Fix: Task_id → id
    task.status = "pending"
    task.save()
    task_commit.delete()
    return Response({"message": "Commit denied and task status updated."}, status=status.HTTP_200_OK)
