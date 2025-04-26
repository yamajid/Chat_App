from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from dotenv import load_dotenv
from chat_backend.models import ChatRoom
import datetime, jwt, os
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated 
import core.settings as settings

User = get_user_model()
load_dotenv()

class CustomRefreshTokenView(APIView):
    permission_classes = []
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        print("ssssssss")
        if not refresh_token:
            return Response("No refresh token available", status=404)
        try:
            # token = RefreshToken(refresh_token)
            decoded_token = jwt.decode(
                refresh_token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            # Get the user
            user_id =  decoded_token['user_id']
            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response("No matched user ", 404)
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            access_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            response = Response(data={'access_token generated'}, status=200)
            response.set_cookie(
                key='access_token',
                value=access_token,
                expires=access_token_expiry,
                httponly=False,
                samesite='Lax',
                secure=False,
                path='/'
            )
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=400)



class UserRegister(APIView):
    permission_classes = []
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        general_room = ChatRoom.objects.get(room_type='general')
        general_room.participants.add(user)
        return Response({'user registred successfully'}, status=201)


class UserLogin(APIView):
    permission_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not password or not username:
            return Response({'username and password required'}, status=400)
        try: 
            user = get_object_or_404(User, username=username)
            if not user.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return Response({'error': 'user not found'}, status=404)
        
        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token
        response = Response({
            'user': user.id,
            'message': "you logged success",
        }, status=200)

        refresh_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=5)
        access_expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        response.set_cookie(key='refresh_token', value=refresh_token, httponly=True, path='/', samesite='Lax', secure=False, expires=refresh_expiry) 
        response.set_cookie(key='access_token', value=access_token, httponly=False, path='/', samesite='Lax', secure=False, expires=access_expiry)
        return response


class UserLogout(APIView):
    permission_classes = []
    def post(self, request):
        
        response = Response({
            'message': 'User logged out successfully'
        }, status=200)
        response.delete_cookie(
            'access_token',
            path='/',
        )
        response.delete_cookie(
            'refresh_token',
            path='/',
        )
        return response
        

# Create your views here.
1
