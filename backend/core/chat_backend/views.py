from django.shortcuts import render
from rest_framework.response import  Response
from rest_framework import  status
from rest_framework.views import APIView
from .serializers import MessageSerializers
from .models import Message, ChatRoom
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()


class GeneralMessages(APIView):
    def get(self, request):
        try:
            room_name = request.GET.get('room_name')
            print(room_name)
            chat_room = ChatRoom.objects.get(name=room_name)
            message = Message.objects.filter(room=chat_room)
            serializer = MessageSerializers(message, many=True)
            return Response({"messages": serializer.data}, status=200)
        except Exception as e:
            print(e)

class FetchRooms(APIView):
    def get(self, request):
        user = request.GET.get('username')
        rooms = ChatRoom.objects.filter(participants=user, room_type="private").order_by('created_at')
        print(rooms)
        return Response({"rooms"}, status=200)
    
class CreateNewRoom(APIView):
    def get(self, request):
        username = request.GET.get("username")
        user = get_object_or_404(User, username=username)
        chat_room = ChatRoom.objects.create(name="test", room_type="private")
        if user not in chat_room.participants:
            chat_room.participants.add(user)
        return Response({"addes success"}, status=201)
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