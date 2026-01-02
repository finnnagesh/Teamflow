from django.db import models
from task.models import Task 
from project.models import Project
from user.models import CustomUser
class TaskCommit(models.Model):
    github_task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    project_id = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="task_commits",
    )
    completed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="task_commits",
    )
    commit_id = models.CharField(
        max_length=40
    )
    message = models.TextField()
    step = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional step name like clone/build/test/push"
    )
    is_successful = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
