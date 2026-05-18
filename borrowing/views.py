from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import BorrowRecord
from .serializers import BorrowRecordSerializer
from .forms import BorrowRequestForm, ProcessRequestForm
from books.models import Book

class IsLibrarianOrAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )




class BorrowRecordListAPIView(generics.ListAPIView):
    
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
           
            return BorrowRecord.objects.all().select_related('member', 'book')
        
        return BorrowRecord.objects.filter(
            member=user
        ).select_related('member', 'book')


class BorrowRecordDetailAPIView(generics.RetrieveAPIView):
    
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return BorrowRecord.objects.all()
        return BorrowRecord.objects.filter(member=user)



@login_required
def borrow_request_view(request, book_pk):
    
    if not request.user.is_member:
        messages.error(request, 'Only members can request books.')
        return redirect('book_list')

    book = get_object_or_404(Book, pk=book_pk)

    if not book.is_available:
        messages.error(
            request,
            f'Sorry, "{book.title}" has no available copies right now.'
        )
        return redirect('book_detail', pk=book_pk)

   
    existing = BorrowRecord.objects.filter(
        member=request.user,
        book=book,
        status__in=[
            BorrowRecord.Status.REQUESTED,
            BorrowRecord.Status.APPROVED,
            BorrowRecord.Status.BORROWED,
        ]
    ).exists()  

    if existing:
        messages.warning(
            request,
            f'You already have an active request for "{book.title}".'
        )
        return redirect('book_detail', pk=book_pk)

    if request.method == 'POST':
        
        BorrowRecord.objects.create(
            member=request.user,
            book=book,
        )
        messages.success(
            request,
            f'Your request for "{book.title}" has been submitted. '
            f'Please wait for librarian approval.'
        )
        return redirect('my_borrows')

    
    return render(request, 'borrowing/borrow_request_confirm.html', {
        'book': book,
        'title': f'Request: {book.title}',
    })


@login_required
def my_borrows_view(request):
    
    borrow_records = BorrowRecord.objects.filter(
        member=request.user
    ).select_related('book', 'book__genre').order_by('-created_at')

    
    active_loans = [
        r for r in borrow_records
        if r.status in [
            BorrowRecord.Status.REQUESTED,
            BorrowRecord.Status.APPROVED,
            BorrowRecord.Status.BORROWED,
            BorrowRecord.Status.OVERDUE,
        ]
    ]

    history = [
        r for r in borrow_records
        if r.status in [
            BorrowRecord.Status.RETURNED,
            BorrowRecord.Status.REJECTED,
        ]
    ]

    context = {
        'active_loans': active_loans,
        'history': history,
        'title': 'My Borrowing History',
    }
    return render(request, 'borrowing/my_borrows.html', context)


@login_required
def borrow_requests_view(request):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    
    pending = BorrowRecord.objects.filter(
        status=BorrowRecord.Status.REQUESTED
    ).select_related('member', 'book').order_by('request_date')

    
    recent = BorrowRecord.objects.filter(
        status__in=[
            BorrowRecord.Status.APPROVED,
            BorrowRecord.Status.REJECTED,
        ]
    ).select_related('member', 'book').order_by('-updated_at')[:10]

    context = {
        'pending': pending,
        'recent': recent,
        'title': 'Borrow Requests',
    }
    return render(request, 'borrowing/borrow_requests.html', context)


@login_required
def process_request_view(request, pk):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    borrow_record = get_object_or_404(BorrowRecord, pk=pk)

    
    if borrow_record.status != BorrowRecord.Status.REQUESTED:
        messages.warning(
            request,
            'This request has already been processed.'
        )
        return redirect('borrow_requests')

    if request.method == 'POST':
        form = ProcessRequestForm(request.POST)

        if form.is_valid():
            action = form.cleaned_data['action']
            note = form.cleaned_data['librarian_note']

            if action == 'approve':
                
                borrow_record.approve(librarian=request.user)
                messages.success(
                    request,
                    f'Request approved for {borrow_record.member.username}.'
                )
            elif action == 'reject':
                borrow_record.reject(librarian=request.user, note=note)
                messages.success(
                    request,
                    f'Request rejected for {borrow_record.member.username}.'
                )

            return redirect('borrow_requests')
    else:
        form = ProcessRequestForm()

    context = {
        'form': form,
        'record': borrow_record,
        'title': 'Process Borrow Request',
    }
    return render(request, 'borrowing/process_request.html', context)


@login_required
def mark_borrowed_view(request, pk):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    borrow_record = get_object_or_404(BorrowRecord, pk=pk)

    if borrow_record.status != BorrowRecord.Status.APPROVED:
        messages.warning(request, 'This record cannot be marked as borrowed.')
        return redirect('borrow_requests')

    if request.method == 'POST':
        
        borrow_record.mark_borrowed(borrow_days=14)
        messages.success(
            request,
            f'"{borrow_record.book.title}" marked as borrowed by '
            f'{borrow_record.member.username}. '
            f'Due: {borrow_record.due_date}'
        )
        return redirect('borrow_requests')

    return render(request, 'borrowing/mark_borrowed_confirm.html', {
        'record': borrow_record,
        'title': 'Confirm Borrowed',
    })


@login_required
def mark_returned_view(request, pk):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    borrow_record = get_object_or_404(BorrowRecord, pk=pk)

    if borrow_record.status not in [
        BorrowRecord.Status.BORROWED,
        BorrowRecord.Status.OVERDUE
    ]:
        messages.warning(request, 'This record cannot be marked as returned.')
        return redirect('active_loans')

    if request.method == 'POST':
        
        borrow_record.mark_returned()
        messages.success(
            request,
            f'"{borrow_record.book.title}" returned by '
            f'{borrow_record.member.username}.'
        )
        return redirect('active_loans')

    return render(request, 'borrowing/mark_returned_confirm.html', {
        'record': borrow_record,
        'title': 'Confirm Return',
    })


@login_required
def active_loans_view(request):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    
    active = BorrowRecord.objects.filter(
        status__in=[
            BorrowRecord.Status.BORROWED,
            BorrowRecord.Status.OVERDUE,
        ]
    ).select_related('member', 'book').order_by('due_date')

    
    today = timezone.now().date()
    for record in active:
        if (record.status == BorrowRecord.Status.BORROWED and
                record.due_date and record.due_date < today):
            record.mark_overdue()

    active = BorrowRecord.objects.filter(
        status__in=[
            BorrowRecord.Status.BORROWED,
            BorrowRecord.Status.OVERDUE,
        ]
    ).select_related('member', 'book').order_by('due_date')

    context = {
        'active': active,
        'title': 'Active Loans',
        'today': today,
    }
    return render(request, 'borrowing/active_loans.html', context)