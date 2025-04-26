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
            return Response({"messages": serializer.data}, status=200)
        except Exception as e:
            print(e)

class FetchRooms(APIView):
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            id = request.GET.get("id")
            users = User.objects.exclude(id=id)
            serializer = UserSerializer(users, many=True)
            return Response({"users": serializer.data}, status=200)
        except Exception as e:
            print(e)
            return Response({"not found"}, status=400)
        
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            sender_username = request.user
            sender = User.objects.get(username=sender_username)
            if not sender:
                return Response ({"user not found"}, status=404)
            invite = Invitation.objects.filter(invitee=sender_username.id)
            serializer = InvitationSerializers(invite, many=True)
            return Response({"Invitations": serializer.data, "count": len(serializer.data)}, status=200)
        except Exception as e:
            print(e)
            return Response("bad request" , status=400)


class RespondToInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            pk = request.GET.get("inviteId")
            invitation = Invitation.objects.get(
                inviter=pk,
                invitee=request.user,
                status_choice='pending'
            )
            
            new_status = request.data.get('status')
            
            if new_status == 'accepted':
                room = ChatRoom.objects.create(
                    name=f"{invitation.inviter.username}-{invitation.invitee.username}",
                    room_type='private'
                )
                room.participants.add(invitation.inviter, invitation.invitee)
                room.save()
                invitation.delete()
                
                return Response({
                    "message": "Invitation accepted. New room created.",
                    "room_id": room.id
                }, status=status.HTTP_200_OK)
                
            elif new_status == 'rejected':
                invitation.delete()
                return Response(
                    {"message": "Invitation rejected and removed."},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Invalid status. Use 'accepted' or 'rejected'"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                    
        except Invitation.DoesNotExist:
            return Response(
                {"error": "Invitation not found or already processed"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    

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
                return Response ({"user not found"}, status=404)
            if Invitation.objects.filter(inviter=sender.id, invitee=receiver.id).exists():
                return Response({"invitation is already sent to this user"}, status=400)
            invitation_data = {
                "inviter": sender_username.id,
                "invitee": receiver.id,
                "status_choice": "pending"
            }
            serializer = InvitationSerializers(data=invitation_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"invitation created success"}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        





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