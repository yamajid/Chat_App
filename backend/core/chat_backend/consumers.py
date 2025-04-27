# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import MessageSerializers
from channels.db import database_sync_to_async
from authentication import models
from django.contrib.auth import get_user_model
from .models import Message, ChatRoom
from .serializers import MessageSerializers

User = get_user_model()
priv_active_connections = []
gene_active_connections = []

class GeneralChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        self.room_group_name = "general"
        self.room_group_name = f'chat_{self.room_group_name}' 
        await self.accept()
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        ) 

    async def disconnect(self, close_code):
        # Your disconnection logic here
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.close()

        pass


    async def receive(self, text_data):
        data = json.loads(text_data)
        if data:
            message = {
                "type" : "general",
                "room" : 1,
                "sender" : data["sender"],
                "content" : data["content"],
                "is_invitation" : False
            }
            await self.savemessage(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender": self.channel_name
                }
            )

    @database_sync_to_async
    def savemessage(self, message):
        serializer = MessageSerializers(data=message)
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)

    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))



class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        print(user)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'private_{self.room_name}'
        
        # Verify user has permission to join this room
        if self.user not in self.priv_active_connections:
            if await self.verify_user_permission():
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                self.priv_active_connections.append(self.user)
                await self.accept()
            else:
                await self.close()

    async def disconnect(self):
        print("diconection")
        await self.priv_active_connections.remove(self.user)
        print(self.user)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = {
            "type": "private",
            "room": self.room_name,
            "sender": data["sender"],
            "content": data["content"],
            "is_invitation": False
        }
        
        await self.save_message(message)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message
            }
        )

    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))

    @database_sync_to_async
    def save_message(self, message):
        serializer = MessageSerializers(data=message)
        if serializer.is_valid():
            serializer.save()

    @database_sync_to_async
    def verify_user_permission(self):
        """Check if user is a participant of this private room"""
        user = self.scope["user"]
        try:
            room = ChatRoom.objects.get(
                name=self.room_name,
                participants=user
            )
            return True
        except ChatRoom.DoesNotExist:
            return False