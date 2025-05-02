import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
from channels.auth import AuthMiddlewareStack

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):


        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode("utf-8")
        cookies = self.parse_cookies(cookie_header)
        
        access_token = cookies.get("access_token")

        if not access_token:
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)
        
        # print("user", access_token)
        try:
            decoded_token = jwt.decode(
                access_token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            user = await self.get_user(decoded_token['user_id'])
            
            scope['user'] = user
        except jwt.ExpiredSignatureError:
            scope['user'] = AnonymousUser()
        except (jwt.InvalidTokenError, KeyError):
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @staticmethod
    def parse_cookies(cookie_header):
        """Parses the Cookie header to extract individual cookies."""
        cookies = {}
        if cookie_header:
            for cookie in cookie_header.split(";"):
                key, value = cookie.strip().split("=", 1)
                cookies[key] = value
        return cookies

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()