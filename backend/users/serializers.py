from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'address',
            'is_verified',
            'created_at'
        )

class RegisterSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True,
        label="Confirm Password"
    )

    class Meta:
        model = User

        fields = (
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password2',
            'phone_number',
            'address'
        )

    def validate(self, attrs):

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    
class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(
        required=True,
        write_only=True
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )

    new_password2 = serializers.CharField(
        required=True,
        write_only=True
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "New passwords do not match."}
            )
        return attrs