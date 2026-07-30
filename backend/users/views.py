from rest_framework import generics, permissions, status, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q

from .serializers import (
    UserSerializer,
    CreateUserSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """Only admins can access"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class IsAdminOrLibrarian(permissions.BasePermission):
    """Admins and librarians can access"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['ADMIN', 'LIBRARIAN']
        )


# ===========================================================================
# AUTH VIEWS
# ===========================================================================

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/users/profile/  — get own profile
    PATCH /api/users/profile/  — update own profile
    """
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
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class LogoutAPIView(APIView):
    """POST /api/auth/logout/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
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


class ChangePasswordAPIView(APIView):
    """POST /api/users/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(
                serializer.validated_data['old_password']
            ):
                return Response(
                    {'old_password': 'Incorrect password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.set_password(
                serializer.validated_data['new_password']
            )
            request.user.save()
            return Response({'message': 'Password changed.'})
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ===========================================================================
# USER MANAGEMENT — Admin creates Librarians, Librarian creates Members
# ===========================================================================

class CreateUserAPIView(generics.CreateAPIView):
    """
    POST /api/users/create/
    Admin can create any user.
    Librarian can only create Members.
    """
    serializer_class   = CreateUserSerializer
    permission_classes = [IsAdminOrLibrarian]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class UsersListAPIView(generics.ListAPIView):
    """
    GET /api/users/
    Admin sees all users.
    Librarian sees only Members.
    """
    serializer_class   = UserSerializer
    permission_classes = [IsAdminOrLibrarian]

    def get_queryset(self):
        user     = self.request.user
        queryset = User.objects.all().order_by('-created_at')

        # Librarians only see members
        if user.is_librarian:
            queryset = queryset.filter(role='MEMBER')

        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        # Search
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(student_id__icontains=search)
            )

        return queryset


class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/users/<pk>/  — get user
    PATCH  /api/users/<pk>/  — update user
    DELETE /api/users/<pk>/  — delete user (admin only)
    """
    serializer_class   = UserSerializer
    permission_classes = [IsAdminOrLibrarian]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        # Librarians can only see/edit members
        return User.objects.filter(role='MEMBER')

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Only admins can delete users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)