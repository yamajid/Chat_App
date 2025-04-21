from django.urls import path
from .consumers import ChatConsumer
websocket_urlpatterns = [


    path('ws/chat/', ChatConsumer.as_asgi()),  # Adjust the path and consumer

]