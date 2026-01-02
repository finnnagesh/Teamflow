from rest_framework.serializers import ModelSerializer
from .models import ChatMessage
from project.serializers import ProjectSerializer
from user.serializers import Userserializer
class ChatMessageSerializer(ModelSerializer):
    sender = Userserializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'project', 'message', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']