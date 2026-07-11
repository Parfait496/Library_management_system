# users/views.py — API views with library filtering

from rest_framework import generics, permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from core.mixins import LibraryFilterMixin

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class LibraryFilterMixin:
    """Filter users by library"""

    def get_library_queryset(self, queryset):
        user = self.request.user

        if user.role == 'ADMIN':
            return queryset

        if hasattr(user, 'library') and user.library:
            return queryset.filter(library=user.library)

        return queryset.none()


# ===========================================================================
# AUTH VIEWS
# ===========================================================================

class RegisterAPIView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Send verification email
        from core.emails import send_verification_email
        send_verification_email(user)


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/profile/"""
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [
        parsers.MultiPartParser,
        parsers.FormParser,
        parsers.JSONParser,
    ]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ChangePasswordAPIView(APIView):
    """POST /api/users/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            if not user.check_password(
                serializer.validated_data['old_password']
            ):
                return Response(
                    {'old_password': 'Incorrect password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'})

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutAPIView(APIView):
    """POST /api/auth/logout/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token         = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class VerifyEmailAPIView(APIView):
    """POST /api/auth/verify-email/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()

        if not token:
            return Response(
                {'detail': 'Verification code is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email_verification_token=token)
            user.email_verified               = True
            user.email_verification_token     = None
            user.save(update_fields=[
                'email_verified', 'email_verification_token'
            ])

            from core.emails import send_welcome_email
            send_welcome_email(user)

            return Response(
                {'detail': 'Email verified! You can now log in.'}
            )

        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid verification code.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResendVerificationAPIView(APIView):
    """POST /api/auth/resend-verification/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        try:
            user = User.objects.get(email=email, email_verified=False)
            from core.emails import send_verification_email
            send_verification_email(user)
        except User.DoesNotExist:
            pass  # do not reveal if email exists

        return Response({
            'detail': 'If that email exists and is unverified, we sent a code.'
        })


class ForgotPasswordAPIView(APIView):
    """POST /api/auth/forgot-password/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        try:
            user = User.objects.get(email=email, is_active=True)

            import secrets
            token                         = str(secrets.randbelow(900000) + 100000)
            user.email_verification_token = token
            user.save(update_fields=['email_verification_token'])

            from django.core.mail import send_mail
            from django.conf import settings
            send_mail(
                subject='Password Reset Code — LibraryMS',
                message=f'Your reset code is: {token}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass

        return Response({
            'detail': 'If that email exists, we sent a reset code.'
        })


class ResetPasswordAPIView(APIView):
    """POST /api/auth/reset-password/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token    = request.data.get('token', '').strip()
        password = request.data.get('password', '')

        if not token or not password:
            return Response(
                {'detail': 'Token and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user                          = User.objects.get(email_verification_token=token)
            user.set_password(password)
            user.email_verification_token = None
            user.save()
            return Response({'detail': 'Password reset successfully.'})

        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid or expired code.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ===========================================================================
# MEMBERS MANAGEMENT VIEWS
# ===========================================================================

class MembersListAPIView(LibraryFilterMixin, generics.ListAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return User.objects.none()

        base = User.objects.filter(
            role='MEMBER'
        ).order_by('-date_joined')

        # Apply library filter
        base = self.get_library_queryset(base, 'library')

        # Search
        search = self.request.query_params.get('search', '')
        if search:
            from django.db.models import Q
            base = base.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return base


class MemberDetailAPIView(LibraryFilterMixin, generics.RetrieveAPIView):
    """GET /api/users/members/<pk>/"""
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return User.objects.none()

        queryset = User.objects.filter(role='MEMBER')
        return self.get_library_queryset(queryset)