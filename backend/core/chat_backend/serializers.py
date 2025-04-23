

from rest_framework import serializers
from .models import Message, ChatRoom
from authentication.serializers import UserSerializer
class MessageSerializers(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["room", "sender", "content", 'timestamp', "is_invitation"]

class ChatRoomSerializers(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    class Meta:
        model = ChatRoom
        fields = ["name", "room_type", "participants", "created_at"]