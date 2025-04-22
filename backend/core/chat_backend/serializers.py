

from rest_framework import serializers
from .models import Message, ChatRoom

class MessageSerializers(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["room", "sender", "content", 'timestamp', "is_invitation"]

class ChatRoomSerializers(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["ROOM_TYPES", "name", "room_types", "participants"]