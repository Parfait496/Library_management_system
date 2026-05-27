

from django.urls import path
from . import views

urlpatterns = [
    # List & detail
    path('borrowing/', views.BorrowRecordListAPIView.as_view(), name='api_borrow_list'),
    path('borrowing/<int:pk>/', views.BorrowRecordDetailAPIView.as_view(), name='api_borrow_detail'),

    # Member: request to borrow a book
    path('borrowing/request/<int:book_pk>/', views.BorrowRequestAPIView.as_view(), name='api_borrow_request'),

    # Librarian actions
    path('borrowing/<int:pk>/approve/', views.ApproveRequestAPIView.as_view(), name='api_approve'),
    path('borrowing/<int:pk>/reject/', views.RejectRequestAPIView.as_view(), name='api_reject'),
    path('borrowing/<int:pk>/mark-borrowed/', views.MarkBorrowedAPIView.as_view(), name='api_mark_borrowed'),
    path('borrowing/<int:pk>/mark-returned/', views.MarkReturnedAPIView.as_view(), name='api_mark_returned'),
]