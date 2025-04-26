

from rest_framework import serializers
from .models import Message, ChatRoom, Notification, Invitation
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

class NotificationSerializers(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["sender", "recipient", "message", "is_read", "notification_type", "timestamp"]

    extra_kwargs = {
        'timestamp': {'read_only': True},  # Auto-set in model
        'is_read': {'read_only': True}
    }

class InvitationSerializers(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ["inviter", "invitee", "status_choice", "timestamp"]
    extra_kwargs = {
        'timestamp': {'read_only': True},
        'inviter': {'read_only': True}, 
    }
