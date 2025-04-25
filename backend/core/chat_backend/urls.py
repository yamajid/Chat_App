
from django.urls import path
from .views import GeneralMessages, FetchRooms, CreateNewRoom, FetchUsers, Notification

urlpatterns = [
    path('general/', GeneralMessages.as_view()),
    path('rooms/', FetchRooms.as_view()),
    path('createroom/', CreateNewRoom.as_view()),
    path('users/', FetchUsers.as_view()),
    path('notify/', Notification.as_view()),
]