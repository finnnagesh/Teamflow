from django.urls import path
from . import views

urlpatterns = [
    # Existing patterns
    path('commit_task/', views.TaskInitializeView.as_view(), name='commit_task'),
    
    # ✅ ADD THESE TWO:
    path('task_request/accept/', views.acceptcommit, name='accept_commit'),
    path('task_request/deny/', views.denycommit, name='deny_commit'),
    
    # ... other patterns
]
