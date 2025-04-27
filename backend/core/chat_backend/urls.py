
from django.urls import path
from .views import GeneralMessages, FetchRooms, FetchUsers, NotificationView, InvitationView, RespondToInvitationView, FetchRoom

urlpatterns = [
    path('general/', GeneralMessages.as_view()),
    path('rooms/', FetchRooms.as_view()),
    path('users/', FetchUsers.as_view()),
    path('invite/', InvitationView.as_view()),
    path('notify/', NotificationView.as_view()),
    path('accpetorreject/', RespondToInvitationView.as_view()),
    path('room/', FetchRoom.as_view()),
]