# serializers.py
from rest_framework import serializers
from .models import TaskCommit
from user.serializers import Userserializer  # Fix import name

class TaskCommitListSerializer(serializers.ModelSerializer):  # ✅ NEW for listing
    completed_by = Userserializer(read_only=True)  # Nested user data
    
    class Meta:
        model = TaskCommit
        fields = '__all__'  # All model fields including commit_id, is_successful, etc.
        read_only_fields = ('id', 'created_at')

class TaskCommitCreateSerializer(serializers.ModelSerializer):  # Keep for POST
    completed_by = Userserializer(read_only=True)
    class Meta:
        model = TaskCommit
        fields = (
            'task', 'committer', 'commit_message', 'commit_data',
            'commit_id', 'github_task', 'step', 'is_successful'  # ✅ Add missing fields
        )
        read_only_fields = ('id', 'created_at', 'completed_by')

class TaskCommitSerializer(serializers.ModelSerializer):  # Keep for POST validation
    class Meta:
        model = TaskCommit
        fields = "__all__"
        read_only_fields = ("id", "created_at")
