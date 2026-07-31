from rest_framework import generics, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import csv
import io

from django.db.models import Q

from .models import Book, Genre, BookSuggestion
from .serializers import (
    BookSerializer,
    GenreSerializer,
    BookSuggestionSerializer,
)


class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


# ===========================================================================
# BOOK VIEWS
# ===========================================================================

class BookListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BookSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['title', 'author', 'isbn', 'genre__name']
    ordering_fields  = ['title', 'author', 'created_at']
    ordering         = ['-created_at']

    def get_queryset(self):
        base = Book.objects.all().select_related('genre', 'added_by')

        # ?genre=<subcategory_id> — exact subcategory match
        genre_id = self.request.query_params.get('genre')
        if genre_id:
            base = base.filter(genre_id=genre_id)

        # ?category=<top_level_genre_id> — any book whose genre is
        # that category itself OR one of its subcategories
        category_id = self.request.query_params.get('category')
        if category_id:
            base = base.filter(
                Q(genre_id=category_id) | Q(genre__parent_id=category_id)
            )

        return base

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class BookDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.all().select_related('genre')

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

class GenreListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = GenreSerializer
    pagination_class = None

    def get_queryset(self):
        base = Genre.objects.all().select_related('parent')

        # ?top_level=true returns only parent categories
        # (e.g. "Medical Sciences"), each with its subcategories
        # nested inside via the serializer. Omit it to get the
        # flat list of every genre and subcategory.
        top_level = self.request.query_params.get('top_level')
        if top_level and top_level.lower() in ('true', '1', 'yes'):
            base = base.filter(parent__isnull=True)

        return base

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()


class GenreDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GenreSerializer

    def get_queryset(self):
        return Genre.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsLibrarianOrAdmin()]


# ===========================================================================
# SUGGESTION VIEWS
# ===========================================================================

class BookSuggestionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BookSuggestion.objects.all().select_related('suggested_by')

        # Members only see their own suggestions
        if user.role == 'MEMBER':
            return base.filter(suggested_by=user)

        return base

    def perform_create(self, serializer):
        serializer.save(suggested_by=self.request.user)


class BookSuggestionDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BookSuggestion.objects.all()

        if user.role == 'MEMBER':
            return base.filter(suggested_by=user)

        return base

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

                # Skip duplicate ISBN
                if isbn and Book.objects.filter(isbn=isbn).exists():
                    skipped += 1
                    continue

                genre = None
                genre_name    = row.get('genre', '').strip()
                category_name = row.get('category', '').strip()

                if genre_name:
                    parent = None
                    if category_name:
                        parent, _ = Genre.objects.get_or_create(
                            name=category_name, parent=None
                        )
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name, parent=parent
                    )
                elif category_name:
                    # Only a top-level category given, no subcategory
                    genre, _ = Genre.objects.get_or_create(
                        name=category_name, parent=None
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