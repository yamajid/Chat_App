
from django.urls import path
from .views import UserRegister, UserLogin, UserLogout, CustomRefreshTokenView

urlpatterns = [
    path('user/register', UserRegister.as_view()),
    path('user/login', UserLogin.as_view()),
    path('user/logout', UserLogout.as_view()),
    path('user/refresh', CustomRefreshTokenView.as_view()),
]
 