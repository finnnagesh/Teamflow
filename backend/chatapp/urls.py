from django.urls import path
from .views import *
urlpatterns = [
    path('chatapp_home/', chatapp_home, name='chatapp_home'),
]