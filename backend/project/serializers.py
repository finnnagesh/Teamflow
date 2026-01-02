from rest_framework import serializers
from .models import Project
from user.models import CustomUser
from user.serializers import Userserializer
class ProjectSerializer(serializers.ModelSerializer):
    # Show contributors
    contributors = Userserializer(read_only=True, many=True)

    # Write-only contributor IDs
    contributor_ids = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        many=True,
        write_only=True,
        required=False,
        default=[]
    )

    # Show created_by (read-only)
    created_by = Userserializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'repo_url',
            'created_by',
            'contributors',
            'contributor_ids',   # ADD IT HERE PROPERLY
            'created_at',
            'updated_at',
        ]

    def create(self, validated_data):
        contributor_ids = validated_data.pop('contributor_ids', [])
        project = Project.objects.create(**validated_data)
        project.contributors.set(contributor_ids)
        return project

    def update(self, instance, validated_data):
        contributor_ids = validated_data.pop('contributor_ids', None)
        instance = super().update(instance, validated_data)

        if contributor_ids is not None:
            instance.contributors.set(contributor_ids)
        return instance
