
from django.urls import path
from .views import GeneralMessages

urlpatterns = [
    path('general/', GeneralMessages.as_view()),
]