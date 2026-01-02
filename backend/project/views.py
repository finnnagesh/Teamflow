from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer
from user.models import CustomUser as User
from task.models import Task
from task.serializers import TaskwithuserSerializer
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Project
from task.models import Task
from .serializers import ProjectSerializer

class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]   # <-- move here

    def get(self, request):
        project_id = request.query_params.get('id')
        if not project_id:
            return Response({"error": "Project_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProjectSerializer(project)
        tasks = Task.objects.filter(project_id=project)
        task_serializer = TaskwithuserSerializer(tasks, many=True)
        response_data = {
            "project": serializer.data,
            "tasks": task_serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        # Add request.user as created_by
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)  # <-- ensures the user is set
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddContributorsView(APIView):
    def post(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({"error": "project_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        user_ids = request.data.get('user_ids')
        if not user_ids or not isinstance(user_ids, list):
            return Response({"error": "user_ids must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)
        valid_users = User.objects.filter(id__in=user_ids)
        if not valid_users.exists():
            return Response({"error": "No valid users found"}, status=status.HTTP_400_BAD_REQUEST)
        new_users = valid_users.exclude(id__in=project.contributors.values_list('id', flat=True))
        if not new_users.exists():
            return Response({"message": "All users are already contributors"}, status=status.HTTP_200_OK)
        project.contributors.add(*new_users)
        project.save()
        return Response({"message": f"{new_users.count()} contributors added successfully"}, status=status.HTTP_200_OK)


class RemoveContributorsView(APIView):
    def post(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({"error": "project_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        user_ids = request.data.get('user_ids')
        if not user_ids or not isinstance(user_ids, list):
            return Response({"error": "user_ids must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)
        current_contributors = project.contributors.filter(id__in=user_ids)
        if not current_contributors.exists():
            return Response({"message": "No matching contributors found to remove"}, status=status.HTTP_200_OK)
        project.contributors.remove(*current_contributors)
        project.save()
        return Response({"message": f"{current_contributors.count()} contributors removed successfully"}, status=status.HTTP_200_OK)
