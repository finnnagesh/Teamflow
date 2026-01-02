import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from project.models import Project
from .models import ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.project_id = self.scope["url_route"]["kwargs"].get("project_id")
        self.user = self.scope.get("user")

        # Accept FIRST (required)
        await self.accept()

        # -------- AUTH CHECK --------
        if not self.user or isinstance(self.user, AnonymousUser):
            await self.send_error("AUTH_REQUIRED", "Authentication required")
            await self.close()
            return

        # -------- PROJECT CHECK --------
        try:
            self.project = await self.get_project(self.project_id)
        except Project.DoesNotExist:
            await self.send_error("PROJECT_NOT_FOUND", "Project does not exist")
            await self.close()
            return

        # -------- PERMISSION CHECK --------
        has_access = await self.user_has_project_access(self.project, self.user)
        if not has_access:
            await self.send_error(
                "PERMISSION_DENIED",
                "You do not have access to this project"
            )
            await self.close()
            return

        # -------- JOIN GROUP --------
        self.room_group_name = f"chat_{self.project_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # -------- SUCCESS --------
        await self.send(text_data=json.dumps({
            "type": "connection_success",
            "user": {
                "id": self.user.id,
                "email": self.user.email,
                "github_username": self.user.github_username,
            }
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error("INVALID_JSON", "Invalid JSON payload")
            return

        message = data.get("message")
        if not message or not message.strip():
            await self.send_error("EMPTY_MESSAGE", "Message cannot be empty")
            return

        saved_msg = await self.save_message(
            self.user, self.project, message.strip()
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            saved_msg
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_error(self, code, message):
        await self.send(text_data=json.dumps({
            "type": "error",
            "code": code,
            "message": message
        }))

    # ---------- DB HELPERS ----------

    @database_sync_to_async
    def get_project(self, project_id):
        return Project.objects.get(id=project_id)

    @database_sync_to_async
    def user_has_project_access(self, project, user):
        return (
            project.created_by_id == user.id
            or project.contributors.filter(id=user.id).exists()
        )

    @database_sync_to_async
    def save_message(self, user, project, message):
        msg = ChatMessage.objects.create(
            sender=user,
            project=project,
            message=message
        )
        return {
            "type": "chat_message",
            "id": msg.id,
            "sender": {
                "id": user.id,
                "email": user.email,
                "github_username": user.github_username,
            },
            "message": msg.message,
            "timestamp": msg.timestamp.isoformat()
        }
