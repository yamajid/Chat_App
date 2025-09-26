from django.shortcuts import render
from rest_framework.response import  Response
from rest_framework import  status
from rest_framework.views import APIView
from .serializers import MessageSerializers, ChatRoomSerializers, NotificationSerializers, InvitationSerializers
from authentication.serializers import UserSerializer
from .models import Message, ChatRoom, Invitation, Notification
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated 
from rest_framework.validators import ValidationError

User = get_user_model()


class GeneralMessages(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            room_name = request.GET.get('room_name')
            chat_room = ChatRoom.objects.get(name=room_name)
            message = Message.objects.filter(room=chat_room)
            serializer = MessageSerializers(message, many=True)
            return Response({"messages": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"Faild getting general message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FetchRooms(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        username = request.GET.get('username')
        try:
            user = get_object_or_404(User, id=username)
            rooms = ChatRoom.objects.filter(participants=user, room_type="private").order_by('created_at')
            serializer = ChatRoomSerializers(rooms, many=True)
            return Response({"rooms": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"errors": {str(e)}}, status=status.HTTP_400_BAD_REQUEST)

class FetchUsers(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            id = request.GET.get("id")
            users = User.objects.exclude(id=id).values('username')
            # Convert queryset to list of dictionaries with just username
            users_data = [{"username": user['username']} for user in users]
            return Response({"users": users_data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"Not found"}, status=status.HTTP_404_NOT_FOUND)

class FetchRoom(APIView):
    def get(self, request):
        room_name = request.GET.get("username")
        if not room_name:
            return Response({"Username not found in request URL"}, status=status.HTTP_404_NOT_FOUND)
        try:
            room = ChatRoom.objects.filter(
                room_type="private"
            ).filter(name=room_name).first()
            if not room:
                return Response({"No matched room available"}, status=status.HTTP_404_NOT_FOUND)
            messages = Message.objects.filter(room=room).order_by("timestamp")
            room_serializer = ChatRoomSerializers(room)
            message_serializers = MessageSerializers(messages, many=True)
            return Response ({
                "room" : room_serializer.data,
                "messages" : message_serializers.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"an error while fetching room": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            sender_username = request.user
            invite = Invitation.objects.filter(invitee=sender_username.id, status_choice="pending")
            serializer = InvitationSerializers(invite, many=True)
            return Response({"Invitations": serializer.data, "count": len(serializer.data)}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response("bad request" , status=status.HTTP_400_BAD_REQUEST)


class RespondToInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            inviter_id = request.GET.get("inviteId")
            invitation = Invitation.objects.get(
                inviter=inviter_id,
                invitee=request.user,
                status_choice='pending'
            )
            
            new_status = request.data.get('status')
            
            if new_status == 'accepted':
                room = ChatRoom.objects.create(name=f"{invitation.inviter.username}_{invitation.invitee.username}", room_type='private')
                room.participants.add(invitation.inviter, invitation.invitee)
                room.save()
                invitation.delete()
                
                return Response({"message": "Invitation accepted. New room created.", "room_id": room.id}, status=status.HTTP_200_OK)
                
            elif new_status == 'rejected':
                invitation.delete()
                return Response({"message": "Invitation rejected and removed."},status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid status. Use 'accepted' or 'rejected'"}, status=status.HTTP_400_BAD_REQUEST)
                    
        except Invitation.DoesNotExist:
            return Response({"error": "Invitation not found or already processed"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_400_BAD_REQUEST)
    

class InvitationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        receiver_username = request.GET.get("username")
        sender_username = request.user
        request.data['inviter'] = sender_username
        try:
            receiver = User.objects.get(username=receiver_username)
            sender = User.objects.get(username=sender_username)
            if not receiver or not sender:
                return Response ({"user not found"}, status=status.HTTP_404_NOT_FOUND)
            existing_room = ChatRoom.objects.filter(participants=sender, room_type="private").filter(participants=receiver, room_type="private").exists()
            if existing_room:
                return Response({"error": "You already share a room with this user"}, status=status.HTTP_400_BAD_REQUEST)
            if Invitation.objects.filter(inviter=sender.id, invitee=receiver.id).exists():
                return Response({"invitation is already sent to this user"}, status=status.HTTP_400_BAD_REQUEST)
            invitation_data = {
                "inviter": sender_username.id,
                "invitee": receiver.id,
                "status_choice": "pending"
            }
            serializer = InvitationSerializers(data=invitation_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"invitation created success"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

