
from django.urls import path
from .views import GeneralMessages, FetchRooms, CreateNewRoom, FetchUsers, NotificationView, InvitationView

urlpatterns = [
    path('general/', GeneralMessages.as_view()),
    path('rooms/', FetchRooms.as_view()),
    path('createroom/', CreateNewRoom.as_view()),
    path('users/', FetchUsers.as_view()),
    path('invite/', InvitationView.as_view()),
    path('notify/', NotificationView.as_view()),
]