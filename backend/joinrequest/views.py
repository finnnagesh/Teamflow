from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import JoinRequest
from .serializers import JoinRequestSerializer, JoindtSerializer
from user.serializers import Userserializer
from project.models import Project

class JoinRequestView(APIView):
    def get(self, request):
        user  = request.user
        su = Userserializer(user)
        user_id = su.data.get('id')
        join_requests = JoinRequest.objects.filter(receiver_id=user_id)
        serializer = JoindtSerializer(join_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JoinRequestSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            join_request = JoinRequest.objects.get(pk=pk)
        except JoinRequest.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        join_request.delete()
        return Response({"check" : "data has been deleted"},status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_join_request(request, pk):
    try:
        join_request = JoinRequest.objects.get(pk=pk)
    except JoinRequest.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    project_id = join_request.project.id
    project = Project.objects.get(id=project_id)
    project.contributors.add(join_request.receiver)
    project.save()
    join_request.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
# Create your views here.
