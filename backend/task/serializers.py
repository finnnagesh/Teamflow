from rest_framework import serializers
from .models import Task
from user.serializers import Userserializer

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
        )
class TaskwithuserSerializer(serializers.ModelSerializer):
    created_by = Userserializer(read_only=True)  
    assigned_to = Userserializer(read_only=True)
    class Meta:
        model = Task
        fields = '__all__'