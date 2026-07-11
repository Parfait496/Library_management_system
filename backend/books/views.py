from rest_framework import generics, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import csv
import io

from .models import Book, Genre, BookSuggestion
from .serializers import (
    BookSerializer,
    GenreSerializer,
    BookSuggestionSerializer,
)
from core.mixins import LibraryFilterMixin


class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


# ===========================================================================
# BOOK VIEWS
# ===========================================================================

class BookListCreateAPIView(
    LibraryFilterMixin,
    generics.ListCreateAPIView
):
    serializer_class = BookSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['title', 'author', 'isbn', 'genre__name']
    ordering_fields  = ['title', 'author', 'created_at']
    ordering         = ['-created_at']

    def get_queryset(self):
        base = Book.objects.all().select_related('genre', 'added_by')
        return self.get_library_queryset(base, 'library')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user    = self.request.user
        library = getattr(user, 'library', None)
        serializer.save(added_by=user, library=library)


class BookDetailAPIView(
    LibraryFilterMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = BookSerializer

    def get_queryset(self):
        base = Book.objects.all().select_related('genre')
        return self.get_library_queryset(base, 'library')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]


# ===========================================================================
# GENRE VIEWS
# ===========================================================================

class GenreListCreateAPIView(
    LibraryFilterMixin,
    generics.ListCreateAPIView
):
    serializer_class = GenreSerializer
    pagination_class = None

    def get_queryset(self):
        base = Genre.objects.all()
        return self.get_library_queryset(base, 'library')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user    = self.request.user
        library = getattr(user, 'library', None)
        serializer.save(library=library)


class GenreDetailAPIView(
    LibraryFilterMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = GenreSerializer

    def get_queryset(self):
        base = Genre.objects.all()
        return self.get_library_queryset(base, 'library')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsLibrarianOrAdmin()]


# ===========================================================================
# SUGGESTION VIEWS
# ===========================================================================

class BookSuggestionListCreateAPIView(
    LibraryFilterMixin,
    generics.ListCreateAPIView
):
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BookSuggestion.objects.all().select_related('suggested_by')

        # Members only see their own suggestions
        if user.role == 'MEMBER':
            return base.filter(suggested_by=user)

        return self.get_library_queryset(base, 'library')

    def perform_create(self, serializer):
        user    = self.request.user
        library = getattr(user, 'library', None)
        serializer.save(suggested_by=user, library=library)


class BookSuggestionDetailAPIView(
    LibraryFilterMixin,
    generics.RetrieveUpdateAPIView
):
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BookSuggestion.objects.all()

        if user.role == 'MEMBER':
            return base.filter(suggested_by=user)

        return self.get_library_queryset(base, 'library')

    def partial_update(self, request, *args, **kwargs):
        if request.user.role not in ['LIBRARIAN', 'ADMIN']:
            return Response(
                {'detail': 'Access denied.'},
                status=status.HTTP_403_FORBIDDEN
            )
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


# ===========================================================================
# CSV IMPORT
# ===========================================================================

class BookCSVImportAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        csv_file = request.FILES.get('file')

        if not csv_file:
            return Response(
                {'detail': 'No file uploaded.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not csv_file.name.endswith('.csv'):
            return Response(
                {'detail': 'File must be a .csv file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            decoded = csv_file.read().decode('utf-8-sig')
            reader  = csv.DictReader(io.StringIO(decoded))
        except Exception as e:
            return Response(
                {'detail': f'Could not read CSV: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        library    = getattr(request.user, 'library', None)
        created    = 0
        skipped    = 0
        row_errors = []

        for i, row in enumerate(reader, start=2):
            try:
                title  = row.get('title', '').strip()
                author = row.get('author', '').strip()

                if not title or not author:
                    row_errors.append(
                        f'Row {i}: title and author are required.'
                    )
                    continue

                isbn = row.get('isbn', '').strip()

                # Skip duplicate ISBN within same library
                if isbn and library and Book.objects.filter(
                    isbn=isbn, library=library
                ).exists():
                    skipped += 1
                    continue

                genre = None
                genre_name = row.get('genre', '').strip()
                if genre_name:
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name,
                        library=library,
                    )

                copies_raw = row.get('copies', '1').strip()
                copies = int(copies_raw) if copies_raw.isdigit() else 1

                year_raw = row.get('year', '').strip()
                year = int(year_raw) if year_raw.isdigit() else None

                Book.objects.create(
                    isbn=isbn or None,
                    title=title,
                    author=author,
                    publisher=row.get('publisher', '').strip() or None,
                    publication_year=year,
                    genre=genre,
                    description=row.get('description', '').strip() or None,
                    total_copies=copies,
                    available_copies=copies,
                    added_by=request.user,
                    library=library,
                )
                created += 1

            except Exception as e:
                row_errors.append(f'Row {i}: {str(e)}')

        return Response({
            'message': f'Done. Created: {created}, Skipped: {skipped}',
            'created': created,
            'skipped': skipped,
            'errors':  row_errors,
        })