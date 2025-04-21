from django.shortcuts import render
from rest_framework.response import  Response
from rest_framework import  status
from rest_framework.views import APIView
from .serializers import MessageSerializers
from .models import Message, ChatRoom


class GeneralMessages(APIView):
    def get(self, request):
        try:
            room_name = request.GET.get('room_name')
            print(room_name)
            chat_room = ChatRoom.objects.get(name=room_name)
            message = chat_room.messages.all()
            serializer = MessageSerializers(message, many=True)
            return Response({"messages": serializer.data}, status=200)
            # print(message)
        except Exception as e:
            print(e)
            pass
        return Response({"messages"}, status=200)
    # def post(self, request, room_name):
    #     try:
    #         chat_room = ChatRoom.objects.get(name=room_name)
    #         serializer = MessageSerializers(request.data)
    #         if serializer.is_valid():
    #             serializer.save(room=chat_room, sender=request.user)
    #             return Response(serializer.data, status=200)''
    #     except ChatRoom.DoesNotExist:
    #         return Response({"error": "Chat room not found"}, status=404)
# Create your views here.
''