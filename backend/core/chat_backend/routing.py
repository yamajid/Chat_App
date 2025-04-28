from django.urls import path, re_path
from .consumers import GeneralChatConsumer, PrivateChatConsumer
websocket_urlpatterns = [


    re_path(r'ws/chat/private/(?P<room_name>\w+)/$', PrivateChatConsumer.as_asgi()),
    re_path('ws/chat/', GeneralChatConsumer.as_asgi()),  # Adjust the path and consumer

] 