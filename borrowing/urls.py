from django.urls import path
from . import views

urlpatterns = [

    path('api/borrowing/', views.BorrowRecordListAPIView.as_view(), name='api_borrow_list'),
    path('api/borrowing/<int:pk>/', views.BorrowRecordDetailAPIView.as_view(), name='api_borrow_detail'),

    path('borrowing/request/<int:book_pk>/', views.borrow_request_view, name='borrow_request'),
    path('borrowing/my-borrows/', views.my_borrows_view, name='my_borrows'),

    # Librarian — see all pending requests
    path('borrowing/requests/', views.borrow_requests_view, name='borrow_requests'),

    path('borrowing/process/<int:pk>/', views.process_request_view, name='process_request'),

    path('borrowing/mark-borrowed/<int:pk>/', views.mark_borrowed_view, name='mark_borrowed'),

    path('borrowing/mark-returned/<int:pk>/', views.mark_returned_view, name='mark_returned'),

    path('borrowing/active-loans/', views.active_loans_view, name='active_loans'),
]