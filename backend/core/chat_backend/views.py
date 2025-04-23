from django.shortcuts import render
from rest_framework.response import  Response
from rest_framework import  status
from rest_framework.views import APIView
from .serializers import MessageSerializers, ChatRoomSerializers
from authentication.serializers import UserSerializer
from .models import Message, ChatRoom
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()


class GeneralMessages(APIView):
    def get(self, request):
        try:
            room_name = request.GET.get('room_name')
            chat_room = ChatRoom.objects.get(name=room_name)
            message = Message.objects.filter(room=chat_room)
            serializer = MessageSerializers(message, many=True)
            return Response({"messages": serializer.data}, status=200)
        except Exception as e:
            print(e)

class FetchRooms(APIView):
    def get(self, request):
        username = request.GET.get('username')
        try:
            user = get_object_or_404(User, id=username)
            rooms = ChatRoom.objects.filter(participants=user, room_type="private").order_by('created_at')
            serializer = ChatRoomSerializers(rooms, many=True)
            return Response({"rooms": serializer.data}, status=200)
        except Exception as e:
            print(e)
            return Response({"errors": {str(e)}}, status=400)

class FetchUsers(APIView):
    def get(self, request):
        try:
            refresh = request.COOKIES.get("refresh_token")
            print(refresh)
            id = request.GET.get("id")
            users = User.objects.exclude(id=id)
            serializer = UserSerializer(users, many=True)
            print(serializer.data)
            return Response({"users": serializer.data}, status=200)
        except Exception as e:
            print(e)
            return Response({"not found"}, status=400)
        
# class Notification(APIView):
#     def post(self, request):
#         try:
#             sender_id = request.GET.get("id")
#         except Exception as e:
#             return Response("bad request", status=400)
    
class CreateNewRoom(APIView):
    def post(self, request):
        return Response({"created"}, status=201)
    pass
#     def get(self, request):
#         username = request.GET.get("username")
#         user = get_object_or_404(User, id=username)
#         rooms = ChatRoom.objects.filter(name="test", room_type="private")
#         if not rooms:
#             chat_room = ChatRoom.objects.create(name="test", room_type="private")
#             if not chat_room.participants.filter(id=user.id).exists():
#                 chat_room.participants.add(user)
#             return Response({"addes success"}, status=201)
#         return Response({"room exist"}, status=404)
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