from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate
from django.dispatch import receiver

User = get_user_model()



class ChatRoom(models.Model):
    ROOM_TYPES = {
        ('general', 'General Chat'),
        ('private', 'Private Chat'),
    }
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES, default='public')
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_invitation = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
    def __str__(self):
        return f"{self.content[:50]}"
        
@receiver(post_migrate)
def create_general_chat(sender, **kwargs):
    if not ChatRoom.objects.filter(room_type='general').exists():
        ChatRoom.objects.create(
            name="general",
            room_type="general"
        )

