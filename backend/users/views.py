# users/views.py
# Pure API views — no templates, no Django forms
# All UI is handled by React frontend
from rest_framework import parsers
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


# ===========================================================================
# AUTH VIEWS
# ===========================================================================

class RegisterAPIView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Send verification email immediately after registration
        from core.emails import send_verification_email
        send_verification_email(user)


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/profile/"""
    serializer_class    = UserSerializer
    permission_classes  = [permissions.IsAuthenticated]
    parser_classes      = [
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
    """
    POST /api/users/change-password/
    Allows logged in user to change their password.
    Requires old password for verification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            # Verify old password before allowing change
            if not user.check_password(
                serializer.validated_data['old_password']
            ):
                return Response(
                    {"old_password": "Incorrect password."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Hash and save new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response(
                {"message": "Password changed successfully."},
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutAPIView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token so it can no longer
    be used to generate new access tokens.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully."},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST
            )


# ===========================================================================
# MEMBERS MANAGEMENT VIEWS
# Only accessible by librarians and admins
# ===========================================================================

class MembersListAPIView(generics.ListAPIView):
    """
    GET /api/users/members/
    Returns paginated list of all MEMBER role users.
    Supports search via ?search= query param.
    Only librarians and admins can access.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Block access for non-staff users
        if self.request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return User.objects.none()

        queryset = User.objects.filter(
            role='MEMBER'
        ).order_by('-date_joined')

        # Optional search filter
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset


class MemberDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/users/members/<pk>/
    Returns full profile of a single member.
    Only librarians and admins can access.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Block access for non-staff users
        if self.request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return User.objects.none()

        # Only return users with MEMBER role
        return User.objects.filter(role='MEMBER')
    

class VerifyEmailAPIView(APIView):
    """
    POST /api/auth/verify-email/
    User submits the 6-digit code from their email.
    No authentication required — user may not be logged in yet.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()

        if not token:
            return Response(
                {'detail': 'Verification code is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find user with this token
            user = User.objects.get(
                email_verification_token=token
            )

            # Mark email as verified
            user.email_verified = True
            user.email_verification_token = None
            user.save(update_fields=['email_verified', 'email_verification_token'])

            # Send welcome email now that email is verified
            from core.emails import send_welcome_email
            send_welcome_email(user)

            return Response(
                {'detail': 'Email verified successfully! You can now log in.'},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid verification code.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResendVerificationAPIView(APIView):
    """
    POST /api/auth/resend-verification/
    Resends the verification email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        try:
            user = User.objects.get(email=email, email_verified=False)
            from core.emails import send_verification_email
            send_verification_email(user)
            return Response(
                {'detail': 'Verification email resent.'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Don't reveal if email exists or not
            return Response(
                {'detail': 'If that email exists and is unverified, we sent a code.'},
                status=status.HTTP_200_OK
            )


class ForgotPasswordAPIView(APIView):
    """
    POST /api/auth/forgot-password/
    Sends a password reset code to email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        try:
            user = User.objects.get(email=email, is_active=True)

            # Generate reset token
            import secrets
            token = str(secrets.randbelow(900000) + 100000)
            user.email_verification_token = token
            user.save(update_fields=['email_verification_token'])

            # Send reset email
            from django.core.mail import send_mail
            from django.conf import settings
            send_mail(
                subject='Password Reset Code — LibraryMS',
                message=f"""
Hi {user.first_name or user.username},

Your password reset code is:

    {token}

Enter this code to reset your password.
If you did not request this, ignore this email.

Library Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists

        return Response(
            {'detail': 'If that email exists, we sent a reset code.'},
            status=status.HTTP_200_OK
        )


class ResetPasswordAPIView(APIView):
    """
    POST /api/auth/reset-password/
    Resets password using the code.
    """
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
            user = User.objects.get(email_verification_token=token)
            user.set_password(password)
            user.email_verification_token = None
            user.save()

            return Response(
                {'detail': 'Password reset successfully.'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid or expired code.'},
                status=status.HTTP_400_BAD_REQUEST
            )