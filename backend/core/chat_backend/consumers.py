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
priv_active_connections = set()
gene_active_connections = set()

class GeneralChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        self.room_name = "general"
        if not self.user in gene_active_connections:
            self.room_group_name = self.room_name
            self.room_group_name = f'chat_{self.room_group_name}' 
            gene_active_connections.add(self.user)
            await self.accept()
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            ) 

    async def disconnect(self, close_code):
        gene_active_connections.discard(self.user)
        await self.channel_layer.group_discard(
            self.room_name,
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
            print("general messageeeeeeee: ", message)
            await self.savemessage(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
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
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.accept()
            await self.close(code=4008)
            return
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'private_{self.room_name}'
        
        # Verify user has permission to join this room
        if self.user not in priv_active_connections:
            priv_active_connections.add(self.user)
            if await self.verify_user_permission():
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                await self.accept()
            else:
                await self.close()

    async def disconnect(self, close_code):
        print(priv_active_connections)
        priv_active_connections.discard(self.user)
        print(priv_active_connections)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        message = {
            "room": self.room_name,
            "sender": data["id"],
            "content": data["content"],
            "is_invitation": False
        }
        
        await self.save_message(message)
        message["sender"] = data["sender"]
        print("private messageeeeeeee: ", message)
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
        try:
            room = ChatRoom.objects.get(name=self.room_name)
            message['room'] = room.id
            serializer = MessageSerializers(data=message)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except Exception as e:
            print(str(e))

    @database_sync_to_async
    def verify_user_permission(self):
        """Check if user is a participant of this private room"""
        user = self.scope["user"]
        try:
            ChatRoom.objects.get(
                name=self.room_name,
                participants=user
            )
            return True
        except ChatRoom.DoesNotExist:
            return False