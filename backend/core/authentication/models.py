from django.db import models

# Create your models here.



class User(models.Model):
    username = models.CharField(unique=True, max_length=100)
    email = models.EmailField(unique=True, max_length=100)
    password = models.CharField(max_length=100)
    date_joined = models.DateTimeField(max_length=100)
    id = models.IntegerField(primary_key=True, unique=True)

    def __str__(self):
        return self.username