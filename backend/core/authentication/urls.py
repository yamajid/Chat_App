
from django.urls import path
from .views import UserRegister
from .views import UserLogin
from .views import UserLogout

urlpatterns = [
    path('user/register', UserRegister.as_view()),
    path('user/login', UserLogin.as_view()),
    path('user/logout', UserLogout.as_view()),
]
 