from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q  # Q lets us do OR queries in Django ORM

from rest_framework import generics, permissions, filters
from rest_framework.response import Response

from .models import Book, Genre
from .serializers import BookSerializer, GenreSerializer
from .forms import BookForm, GenreForm


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

    def get_permissions(self):
       
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        
        serializer.save(added_by=self.request.user)


class BookDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]


class GenreListCreateAPIView(generics.ListCreateAPIView):
    
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarianOrAdmin()]
        return [permissions.IsAuthenticated()]



@login_required
def book_list_view(request):
    
    # Start with all books
    books = Book.objects.all().select_related('genre')

    
    search_query = request.GET.get('search', '')
    if search_query:
       
        books = books.filter(
            Q(title__icontains=search_query) |
            Q(author__icontains=search_query) |
            Q(isbn__icontains=search_query) |
            Q(genre__name__icontains=search_query)
        )

    # Genre filter
    genre_id = request.GET.get('genre', '')
    if genre_id:
        books = books.filter(genre_id=genre_id)

    # Get all genres for the filter dropdown
    genres = Genre.objects.all()

    context = {
        'books': books,
        'genres': genres,
        'search_query': search_query,
        'selected_genre': genre_id,
        'title': 'Book Catalogue',
    }
    return render(request, 'books/book_list.html', context)


@login_required
def book_detail_view(request, pk):
    
    book = get_object_or_404(Book, pk=pk)
    context = {
        'book': book,
        'title': book.title,
    }
    return render(request, 'books/book_detail.html', context)


@login_required
def book_add_view(request):
    
    # Role check — if not librarian or admin, deny access
    if request.user.role not in ['LIBRARIAN', 'ADMIN']:
        messages.error(request, 'You do not have permission to add books.')
        return redirect('book_list')

    if request.method == 'POST':
        
        form = BookForm(request.POST, request.FILES)

        if form.is_valid():
        
            book = form.save(commit=False)
            book.added_by = request.user  

            # Set available_copies equal to total_copies on creation
            book.available_copies = book.total_copies
            book.save()

            messages.success(request, f'"{book.title}" has been added successfully.')
            return redirect('book_detail', pk=book.pk)
        else:
            messages.error(request, 'Please fix the errors below.')
    else:
        form = BookForm()

    return render(request, 'books/book_form.html', {
        'form': form,
        'title': 'Add New Book',
        'button_text': 'Add Book',
    })


@login_required
def book_edit_view(request, pk):
    
    if request.user.role not in ['LIBRARIAN', 'ADMIN']:
        messages.error(request, 'You do not have permission to edit books.')
        return redirect('book_list')

    # Get the book or return 404 if not found
    book = get_object_or_404(Book, pk=pk)

    if request.method == 'POST':
       
        form = BookForm(request.POST, request.FILES, instance=book)

        if form.is_valid():
            form.save()
            messages.success(request, f'"{book.title}" has been updated.')
            return redirect('book_detail', pk=book.pk)
        else:
            messages.error(request, 'Please fix the errors below.')
    else:
        # Pre-fill the form with existing book data
        form = BookForm(instance=book)

    return render(request, 'books/book_form.html', {
        'form': form,
        'title': f'Edit: {book.title}',
        'button_text': 'Save Changes',
        'book': book,
    })


@login_required
def book_delete_view(request, pk):
    
    if request.user.role != 'ADMIN':
        messages.error(request, 'Only admins can delete books.')
        return redirect('book_list')

    book = get_object_or_404(Book, pk=pk)

    if request.method == 'POST':
        title = book.title
        book.delete()
        messages.success(request, f'"{title}" has been deleted.')
        return redirect('book_list')

    return render(request, 'books/book_confirm_delete.html', {
        'book': book,
        'title': f'Delete: {book.title}',
    })