from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q  # Q lets us do OR queries in Django ORM

from rest_framework import generics, permissions, filters
from rest_framework.response import Response

from .models import Book, Genre, BookSuggestion
from .serializers import BookSerializer, GenreSerializer, BookSuggestionSerializer



class IsLibrarianOrAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )



class BookListCreateAPIView(generics.ListCreateAPIView):
    
    queryset = Book.objects.all().select_related('genre')
    serializer_class = BookSerializer

   
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'isbn', 'genre__name']
    ordering_fields = ['title', 'author', 'created_at']
    
    def get_serializer_context(self):
        # Pass request to serializer so it can build full image URLs
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
       
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        
        serializer.save(added_by=self.request.user)


class BookDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]


class GenreListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /api/genres/  — list all genres (no pagination)
    POST /api/genres/  — create a genre (librarian/admin only)
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

    # Override pagination — genres should return all at once
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]





 
class GenreDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/genres/<pk>/  — get genre
    PUT    /api/genres/<pk>/  — update genre
    DELETE /api/genres/<pk>/  — delete genre
    Only librarians and admins can modify.
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsLibrarianOrAdmin()]


class BookSuggestionListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /api/books/suggestions/  — list suggestions
    POST /api/books/suggestions/  — create suggestion (members)
    """
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff see all suggestions
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return BookSuggestion.objects.all().select_related(
                'suggested_by'
            )
        # Members see only their own
        return BookSuggestion.objects.filter(
            suggested_by=user
        )

    def perform_create(self, serializer):
        # Automatically set the logged in user as suggester
        serializer.save(suggested_by=self.request.user)


class BookSuggestionDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/books/suggestions/<pk>/
    PATCH /api/books/suggestions/<pk>/  — update status
    """
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return BookSuggestion.objects.all()
        return BookSuggestion.objects.filter(suggested_by=user)

    def partial_update(self, request, *args, **kwargs):
        """
        Allow librarians to update status and admin_note only
        """
        if request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return Response(
                {'detail': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)