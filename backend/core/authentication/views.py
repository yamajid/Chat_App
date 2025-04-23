from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from dotenv import load_dotenv
from chat_backend.models import ChatRoom
import datetime, jwt, os

User = get_user_model()
load_dotenv()


class UserRegister(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        general_room = ChatRoom.objects.get(room_type='general')
        general_room.participants.add(user)
        return Response({'user registred successfully'}, status=201)


class UserLogin(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not password or not username:
            return Response({'username and password required'}, status=400)
        try: 
            user = get_object_or_404(User, username=username)
            if user.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=400)
        except:
            return Response({'error': 'user not found'}, status=404)
        response = Response({
            'user': user.id,
        }, status=200)
        secret_key = os.getenv('JWT_SECRET_KEY')
        access_token = generate_access_token(secret_key)
        refresh_token = generate_refresh_token(secret_key)
        access_token  = access_token.create_token(user)
        refresh_token = refresh_token.create_token(user)
        response.set_cookie(key='refresh_token', value=refresh_token, httponly=True, path='/') 
        response.set_cookie(key='access_token', value=access_token, httponly=True, path='/')
        return response
        
        
class generate_access_token:


    def __init__(self, secret):
        self.secret_key = secret
        
    def create_token(self, user):

        payload = {
            'type': 'access',
            'user_id': user.id,
            'username': user.username,
            'iat': datetime.datetime.utcnow(),
            'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

        }
        token = jwt.encode(payload, self.secret_key)
        return token

class generate_refresh_token:


    def __init__(self, secret):
        self.secret_key = secret

        
    def create_token(self, user):

        payload = {
            'type': 'refresh',
            'user_id': user.id,
            'username': user.username,
            'iat': datetime.datetime.utcnow(),
            'exp' : datetime.datetime.utcnow() + datetime.timedelta(days=120)

        }
        token = jwt.encode(payload, self.secret_key)
        return token
     

class UserLogout(APIView):
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
