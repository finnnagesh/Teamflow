from django.contrib import admin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework import permissions
from django.urls import path,include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from user.views import github_login, github_callback
schema_view = get_schema_view(
   openapi.Info(
      title="WorkHist API",
      default_version='v1',
      description="API documentation for WorkHist project",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@workhist.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', include('user.urls')),
    path('api/project/', include('project.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/tasks/', include('task.urls')),
    path('api/joinrequest/', include('joinrequest.urls')),
    path('api/chat/', include('chatapp.urls')),
    path("auth/github/", github_login),
    path("auth/github/callback/", github_callback),
    path("api/task_commit/", include("task_commit.urls")),
]


