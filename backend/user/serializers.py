from rest_framework import serializers
from .models import CustomUser

class Userserializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','email', 'password', 'github_username', 'github_auth_token']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)   # 🔥 this hashes the password
        user.save()
        return user

class usserprofileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'github_username']