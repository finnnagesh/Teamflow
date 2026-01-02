from django.urls import path
from .views import *
urlpatterns = [
    path('create_task/', TaskInitializeView.as_view(), name='create_task'),
]