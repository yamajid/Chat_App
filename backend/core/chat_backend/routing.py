from django.urls import path
from .consumers import GeneralChatConsumer, PrivateChatConsumer
websocket_urlpatterns = [


    path('ws/chat/', GeneralChatConsumer.as_asgi()),  # Adjust the path and consumer
    path(r'ws/chat/private/(?P<room_name>\w+)/$', PrivateChatConsumer.as_asgi()),

] 