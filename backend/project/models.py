from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Project(models.Model):
    name = models.CharField(max_length=255 , unique=True , default="New Project")
    description = models.TextField(blank=True, null=True)
    repo_url = models.URLField(max_length=500, default="https://github.com/example/repo")

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    contributors = models.ManyToManyField(User, related_name='contributors', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
    


