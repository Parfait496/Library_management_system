from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    library_name        = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email',
            'first_name', 'last_name',
            'role', 'phone_number', 'address',
            'is_verified', 'email_verified',
            'created_at', 'profile_picture',
            'profile_picture_url',
            'library', 'library_name',
        )
        read_only_fields = (
            'id', 'role', 'is_verified',
            'email_verified', 'created_at',
        )

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                obj.profile_picture.url
            )
        return obj.profile_picture.url

    def get_library_name(self, obj):
        return obj.library.name if obj.library else None


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(
        write_only=True, required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, required=True
    )
    join_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        default=''
    )

    class Meta:
        model  = User
        fields = (
            'username', 'email',
            'first_name', 'last_name',
            'password', 'password2',
            'phone_number', 'address',
            'join_code',
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )

        # Validate join code if provided
        join_code = attrs.get('join_code', '').strip().upper()
        if join_code:
            try:
                from libraries.models import Library
                Library.objects.get(
                    join_code=join_code,
                    is_active=True
                )
            except Exception:
                raise serializers.ValidationError(
                    {'join_code': 'Invalid or inactive library code.'}
                )

        return attrs

    def create(self, validated_data):
        join_code = validated_data.pop('join_code', '').strip().upper()
        validated_data.pop('password2')

        user = User.objects.create_user(**validated_data)

        # Assign library from join code
        if join_code:
            try:
                from libraries.models import Library
                library      = Library.objects.get(
                    join_code=join_code,
                    is_active=True
                )
                user.library = library
                user.save(update_fields=['library'])
            except Exception:
                pass

        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password  = serializers.CharField(
        required=True, write_only=True
    )
    new_password  = serializers.CharField(
        required=True, write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(
        required=True, write_only=True
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {'new_password': 'Passwords do not match.'}
            )
        return attrs