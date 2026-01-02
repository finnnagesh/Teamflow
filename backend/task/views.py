from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from urllib3 import request
from .models import Task
from project.models import Project
from .serializers import TaskSerializer , TaskwithuserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

class TaskInitializeView(APIView):
    def post(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({"error": "project_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project_id=project, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({"error": "project_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        tasks = Task.objects.filter(project_id=project)
        serializer = TaskwithuserSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        pk = request.query_params.get("pk")
        task = get_object_or_404(Task, pk=pk)

        status = request.data.get("status")
        if status not in ["pending", "in_progress", "completed"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        task.status = status
        task.save()
        serializer = TaskSerializer(task)

        return Response(serializer.data, status=200)

