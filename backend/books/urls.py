from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.BookListCreateAPIView.as_view(), name='api_book_list'),
    path('books/<int:pk>/', views.BookDetailAPIView.as_view(), name='api_book_detail'),
    path('genres/', views.GenreListCreateAPIView.as_view(), name='api_genre_list'),
    path('genres/<int:pk>/', views.GenreDetailAPIView.as_view(), name='api_genre_detail'),
]