


from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'date_joined', 'id']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError('Email is required')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value
    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('password is required')
        if len(value) < 8 or len(value) > 100:
            raise serializers.ValidationError('Password is not correct')
        return value
    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError('Username is required')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value
    def create(self, validate_data):
        user = User.objects.create_user(**validate_data)
        return user
    