
from django.urls import path
from .views import GeneralMessages, FetchRooms, CreateNewRoom

urlpatterns = [
    path('general/', GeneralMessages.as_view()),
    path('rooms/', FetchRooms.as_view()),
    path('createroom/', CreateNewRoom.as_view()),
]