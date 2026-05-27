from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.BookListCreateAPIView.as_view(), name='api_book_list'),
    path('books/<int:pk>/', views.BookDetailAPIView.as_view(), name='api_book_detail'),
    path('genres/', views.GenreListCreateAPIView.as_view(), name='api_genre_list'),
    path('genres/<int:pk>/', views.BookDetailAPIView.as_view(), name='api_genre_detail'),
    path('genres/<int:pk>/', views.GenreDetailAPIView.as_view(), name='api_genre_detail'),
    path('books/suggestions/', views.BookSuggestionListCreateAPIView.as_view(), name='api_suggestions'),
    path('books/suggestions/<int:pk>/', views.BookSuggestionDetailAPIView.as_view(), name='api_suggestion_detail'),
]