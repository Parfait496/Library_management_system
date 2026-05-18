from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from rest_framework import generics, permissions

from .models import Fine
from .serializers import FineSerializer


# ===========================================================================
# API VIEWS (return JSON)
# ===========================================================================

class FineListAPIView(generics.ListAPIView):
    """
    GET /api/fines/
    Librarians/admins see all fines.
    Members see only their own fines.
    """
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter fines based on user role"""
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return Fine.objects.all().select_related('member', 'borrow_record')
        # Members only see their own fines
        return Fine.objects.filter(
            member=user
        ).select_related('member', 'borrow_record')


class FineDetailAPIView(generics.RetrieveAPIView):
    """GET /api/fines/<id>/ — get a single fine"""
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return Fine.objects.all()
        return Fine.objects.filter(member=user)


# ===========================================================================
# TEMPLATE VIEWS (return HTML)
# ===========================================================================

@login_required
def fines_list_view(request):
    """
    GET /fines/
    Librarians and admins see all fines.
    Members see only their own fines.
    """
    user = request.user

    if user.is_librarian or user.is_admin:
        # Librarians see all fines grouped by status
        unpaid = Fine.objects.filter(
            status=Fine.Status.UNPAID
        ).select_related('member', 'borrow_record__book')

        resolved = Fine.objects.filter(
            status__in=[Fine.Status.PAID, Fine.Status.WAIVED]
        ).select_related('member', 'borrow_record__book').order_by(
            '-resolved_date'
        )[:20]  # only show last 20 resolved fines

        context = {
            'unpaid': unpaid,
            'resolved': resolved,
            'title': 'Fines Management',
            'is_staff': True,
        }
    else:
        # Members see only their own fines
        my_fines = Fine.objects.filter(
            member=user
        ).select_related('borrow_record__book')

        context = {
            'my_fines': my_fines,
            'title': 'My Fines',
            'is_staff': False,
        }

    return render(request, 'fines/fines_list.html', context)


@login_required
def resolve_fine_view(request, pk):
    """
    GET  /fines/<pk>/resolve/  — show resolve form
    POST /fines/<pk>/resolve/  — mark fine as paid or waived

    Only librarians and admins can resolve fines.
    """
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    fine = get_object_or_404(Fine, pk=pk)

    # Cannot resolve an already resolved fine
    if fine.is_resolved:
        messages.warning(request, 'This fine has already been resolved.')
        return redirect('fines_list')

    if request.method == 'POST':
        # Get the action from the submitted form
        action = request.POST.get('action')
        note = request.POST.get('note', '')

        if action == 'paid':
            fine.mark_paid(resolved_by=request.user)
            messages.success(
                request,
                f'Fine of {fine.amount} RWF marked as paid for '
                f'{fine.member.username}.'
            )
        elif action == 'waive':
            fine.waive(resolved_by=request.user, note=note)
            messages.success(
                request,
                f'Fine of {fine.amount} RWF waived for '
                f'{fine.member.username}.'
            )
        else:
            messages.error(request, 'Invalid action.')
            return redirect('resolve_fine', pk=pk)

        return redirect('fines_list')

    context = {
        'fine': fine,
        'title': f'Resolve Fine — {fine.member.username}',
    }
    return render(request, 'fines/resolve_fine.html', context)


@login_required
def my_fines_view(request):
    """
    GET /fines/my-fines/
    Shortcut for members to see their own fines.
    Redirects librarians/admins to the full fines list.
    """
    if request.user.is_librarian or request.user.is_admin:
        return redirect('fines_list')

    fines = Fine.objects.filter(
        member=request.user
    ).select_related('borrow_record__book').order_by('-issued_date')

    # Calculate total unpaid amount
    # Using Python sum() on a queryset
    total_unpaid = sum(
        f.amount for f in fines
        if f.status == Fine.Status.UNPAID
    )

    context = {
        'fines': fines,
        'total_unpaid': total_unpaid,
        'title': 'My Fines',
    }
    return render(request, 'fines/my_fines.html', context)