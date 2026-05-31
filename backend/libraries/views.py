from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Library
from .serializers import LibrarySerializer, LibraryPublicSerializer

User = get_user_model()


class LibraryListAPIView(generics.ListAPIView):
    """
    GET /api/libraries/
    Returns all active libraries.
    Used on register page so users can select their library.
    """
    queryset           = Library.objects.filter(is_active=True)
    serializer_class   = LibraryPublicSerializer
    permission_classes = [permissions.AllowAny]


class LibraryDetailAPIView(generics.RetrieveAPIView):
    """GET /api/libraries/<slug>/"""
    queryset           = Library.objects.filter(is_active=True)
    serializer_class   = LibraryPublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'


class JoinLibraryAPIView(APIView):
    """
    POST /api/libraries/join/
    Member joins a library using the join code.
    Body: { "join_code": "ABC123" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code', '').strip().upper()

        if not join_code:
            return Response(
                {'detail': 'Join code is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            library = Library.objects.get(
                join_code=join_code,
                is_active=True
            )
        except Library.DoesNotExist:
            return Response(
                {'detail': 'Invalid join code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add user to library
        request.user.library = library
        request.user.save(update_fields=['library'])

        return Response({
            'detail': f'Successfully joined {library.name}!',
            'library': LibraryPublicSerializer(library).data,
        })


class MyLibraryAPIView(APIView):
    """GET /api/libraries/my-library/ — get current user's library"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.library:
            return Response(
                {'detail': 'You have not joined a library yet.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = LibrarySerializer(request.user.library)
        return Response(serializer.data)


class LibraryAdminAPIView(generics.ListCreateAPIView):
    """
    GET  /api/libraries/admin/  — list all libraries (admin only)
    POST /api/libraries/admin/  — create new library (admin only)
    """
    serializer_class   = LibrarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Library.objects.none()
        return Library.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can create libraries.')
        serializer.save()