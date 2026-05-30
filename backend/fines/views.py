# fines/views.py — API views only, 

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum

from .models import Fine
from .serializers import FineSerializer


class IsLibrarianOrAdmin(permissions.BasePermission):
    """Only librarians and admins can access"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


class FineListAPIView(generics.ListAPIView):
    """
    GET /api/fines/
    Librarians and admins see all fines.
    Members see only their own fines.
    Supports ?status=UNPAID filter.
    """
    serializer_class   = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user    = self.request.user
        queryset = Fine.objects.select_related(
            'member',
            'borrow_record',
            'borrow_record__book'
        ).order_by('-issued_date')

        # Members only see their own fines
        if user.role not in ['LIBRARIAN', 'ADMIN']:
            queryset = queryset.filter(member=user)

        # Filter by status if provided — e.g. ?status=UNPAID
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class FineDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/fines/<pk>/
    Get a single fine.
    Members can only see their own fines.
    """
    serializer_class   = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return Fine.objects.all()
        return Fine.objects.filter(member=user)


class ResolveFineAPIView(APIView):
    """
    POST /api/fines/<pk>/resolve/
    Librarian marks fine as paid or waives it.

    Request body:
    {
        "action": "paid" or "waive",
        "note": "optional note"
    }
    """
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        fine   = get_object_or_404(Fine, pk=pk)
        action = request.data.get('action', '')
        note   = request.data.get('note', '')

        # Cannot resolve an already resolved fine
        if fine.is_resolved:
            return Response(
                {'detail': 'This fine is already resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action == 'paid':
            fine.mark_paid(resolved_by=request.user)
            return Response(
                FineSerializer(fine).data,
                status=status.HTTP_200_OK
            )

        elif action == 'waive':
            fine.waive(resolved_by=request.user, note=note)
            return Response(
                FineSerializer(fine).data,
                status=status.HTTP_200_OK
            )

        return Response(
            {'detail': 'Invalid action. Use "paid" or "waive".'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MyFinesSummaryAPIView(APIView):
    """
    GET /api/fines/summary/
    Returns total unpaid fines for the logged in member.
    Used by dashboard to show outstanding balance.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        unpaid = Fine.objects.filter(
            member=request.user,
            status=Fine.Status.UNPAID
        )
        total = unpaid.aggregate(
            total=Sum('amount')
        )['total'] or 0

        return Response({
            'unpaid_count':  unpaid.count(),
            'unpaid_total':  float(total),
            'currency':      'RWF',
        })