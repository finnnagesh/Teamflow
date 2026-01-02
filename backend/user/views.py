from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import Userserializer as MyUserSerializer, usserprofileSerializer
from rest_framework.permissions import IsAuthenticated

# Existing imports
from project.models import Project
from project.serializers import ProjectSerializer
from task.models import Task
from task.serializers import TaskSerializer
from .models import CustomUser as MyUser
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# 👉 NEW imports for join requests
from joinrequest.models import JoinRequest
from joinrequest.serializers import JoindtSerializer

@api_view(['POST'])
def MyUserView(request):
    if request.method == 'POST':
        serializer = MyUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created successfully', 'user_id': user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    user_id = user.id

    # Fetch user-owned and contributed projects
    projects = Project.objects.filter(created_by=user)
    contributed_projects = Project.objects.filter(contributors=user).exclude(created_by=user)

    # Fetch assigned tasks
    assigned_tasks = Task.objects.filter(assigned_to=user)

    # Fetch join requests where the user is the receiver
    join_requests = JoinRequest.objects.filter(receiver_id=user_id)
    join_request_data = JoindtSerializer(join_requests, many=True).data

    # Serialize everything
    user_data = MyUserSerializer(user).data
    owned = ProjectSerializer(projects, many=True).data
    contributed = ProjectSerializer(contributed_projects, many=True).data
    tasks = TaskSerializer(assigned_tasks, many=True).data

    return Response({
        "user": user_data,
        "owned_projects": owned,
        "contributed_projects": contributed,
        "assigned_tasks": tasks,
        "join_requests": join_request_data,     # <-- added here
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def find_users(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'error': 'Query parameter "q" is required.'}, status=status.HTTP_400_BAD_REQUEST)

    users = MyUser.objects.filter(github_username__icontains=query)[:10]
    serializer = usserprofileSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
def github_callback(request):
    code = request.GET.get("code")

    # 1. Exchange code → token
    token_res = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        },
    ).json()

    access_token = token_res.get("access_token")

    if not access_token:
        return JsonResponse({"error": "GitHub auth failed"}, status=400)

    # 2. Fetch GitHub user
    github_user = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()

    # 3. Fetch email
    emails = requests.get(
        "https://api.github.com/user/emails",
        headers={"Authorization": f"Bearer {access_token}"},
    ).json()

    primary_email = next(
        (e["email"] for e in emails if e["primary"] and e["verified"]),
        None,
    )

    if not primary_email:
        return JsonResponse({"error": "Email not available"}, status=400)

    # 4. Create or get user (YOUR MODEL)
    user = User.objects.filter(email=primary_email).first()

    if not user:
        user = User.objects.create_user(
            email=primary_email,
            password=None,  # ✅ OAuth user
            github_username=github_user["login"],
        )

    refresh = RefreshToken.for_user(user)

    return JsonResponse({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
def github_login(request):
    github_auth_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        "&scope=user:email"
    )
    return redirect(github_auth_url)
