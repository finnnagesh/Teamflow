from django.urls import path
from .views import JoinRequestView, accept_join_request

urlpatterns = [
    path('join-requests/', JoinRequestView.as_view()),
    path('join-requests/<int:pk>/', JoinRequestView.as_view()),
    path('join-requests/<int:pk>/accept/', accept_join_request),
]
