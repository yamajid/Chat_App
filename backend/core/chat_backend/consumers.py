# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import MessageSerializers
from channels.db import database_sync_to_async
from authentication import models
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_group_name = "general"
        self.room_group_name = f'chat_{self.room_group_name}' 
        await self.accept()
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        ) 

    async def disconnect(self, close_code):
        await self.close()
        # Your disconnection logic here
        print("diconection")

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
        # if self.channel_name != event["sender_channel_name"]:
        await self.send(text_data=json.dumps({"message": message}))