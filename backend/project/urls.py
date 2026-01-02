from django.urls import path
from .views import *
urlpatterns = [
    path('project_setup/', ProjectListCreateView.as_view(), name='project_list_create'),
    path('add_contributors/', AddContributorsView.as_view(), name='add_contributors'),
    path('remove_contributors/', RemoveContributorsView.as_view(), name='remove_contributors'),
]
