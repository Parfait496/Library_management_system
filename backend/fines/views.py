from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum

from .models import Fine
from .serializers import FineSerializer
from core.mixins import LibraryFilterMixin


class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


class FineListAPIView(LibraryFilterMixin, generics.ListAPIView):
    serializer_class   = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = Fine.objects.all().select_related(
            'member',
            'borrow_record',
            'borrow_record__book'
        ).order_by('-issued_date')

        # Members only see their own fines
        if user.role == 'MEMBER':
            base = base.filter(member=user)
        else:
            base = self.get_library_queryset(
                base, 'borrow_record__book__library'
            )

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            base = base.filter(status=status_filter)

        return base


class FineDetailAPIView(LibraryFilterMixin, generics.RetrieveAPIView):
    serializer_class   = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = Fine.objects.all()

        if user.role == 'MEMBER':
            return base.filter(member=user)

        return self.get_library_queryset(
            base, 'borrow_record__book__library'
        )


class ResolveFineAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        fine    = get_object_or_404(Fine, pk=pk)
        user    = request.user
        library = getattr(user, 'library', None)

        if library and fine.borrow_record.book.library != library:
            return Response(
                {'detail': 'You can only manage your own library.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if fine.is_resolved:
            return Response(
                {'detail': 'Fine already resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action', '')
        note   = request.data.get('note', '')

        if action == 'paid':
            fine.mark_paid(resolved_by=request.user)
            return Response(FineSerializer(fine).data)
        elif action == 'waive':
            fine.waive(resolved_by=request.user, note=note)
            return Response(FineSerializer(fine).data)

        return Response(
            {'detail': 'Invalid action. Use "paid" or "waive".'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MyFinesSummaryAPIView(APIView):
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
            'unpaid_count': unpaid.count(),
            'unpaid_total': float(total),
            'currency':     'RWF',
        })