from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Read serializer — returns user data"""
    full_name           = serializers.ReadOnlyField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email',
            'first_name', 'last_name', 'full_name',
            'role', 'phone_number', 'address',
            'student_id', 'profile_picture',
            'profile_picture_url', 'created_at',
        )
        read_only_fields = ('id', 'role', 'created_at')

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return obj.profile_picture.url


class CreateUserSerializer(serializers.ModelSerializer):
    """
    Used by Admin to create Librarians
    and by Librarians to create Members.
    No public registration — staff controls who gets in.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model  = User
        fields = (
            'username', 'email',
            'first_name', 'last_name',
            'password', 'role',
            'phone_number', 'address',
            'student_id',
        )

    def validate_role(self, value):
        """
        Control which roles can be created.
        Admin can create any role.
        Librarian can only create Members.
        """
        request = self.context.get('request')
        if request and request.user.is_librarian:
            if value != User.Role.MEMBER:
                raise serializers.ValidationError(
                    'Librarians can only create Member accounts.'
                )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user     = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password  = serializers.CharField(required=True, write_only=True)
    new_password  = serializers.CharField(
        required=True, write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {'new_password': 'Passwords do not match.'}
            )
        return attrs