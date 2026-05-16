from django.urls import path
from . import views

urlpatterns = [

  
    # API ENDPOINTS (return JSON)
    
    path('api/books/', views.BookListCreateAPIView.as_view(), name='api_book_list'),
    path('api/books/<int:pk>/', views.BookDetailAPIView.as_view(), name='api_book_detail'),
    path('api/books/genres/', views.GenreListCreateAPIView.as_view(), name='api_genre_list'),

   
    # TEMPLATE URLs (return HTML)
    
    path('books/', views.book_list_view, name='book_list'),
    path('books/add/', views.book_add_view, name='book_add'),
    path('books/<int:pk>/', views.book_detail_view, name='book_detail'),
    path('books/<int:pk>/edit/', views.book_edit_view, name='book_edit'),
    path('books/<int:pk>/delete/', views.book_delete_view, name='book_delete'),
]