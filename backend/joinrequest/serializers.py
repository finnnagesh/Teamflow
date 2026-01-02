from rest_framework.serializers import ModelSerializer
from .models import JoinRequest
from user.serializers import usserprofileSerializer
from project.serializers import ProjectSerializer
from rest_framework import serializers
from .models import JoinRequest

class JoinRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = JoinRequest
        fields = '__all__'
        read_only_fields = ['sender']   # user cannot send sender manually

    def create(self, validated_data):
        request = self.context['request']
        validated_data['sender'] = request.user
        return super().create(validated_data)

class JoindtSerializer(ModelSerializer):
    sender = usserprofileSerializer(read_only=True)
    receiver = usserprofileSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    class Meta:
        model = JoinRequest
        fields = '__all__'