from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import BorrowRecord
from .serializers import BorrowRecordSerializer
from books.models import Book


class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


class BorrowRecordListAPIView(generics.ListAPIView):
    serializer_class   = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BorrowRecord.objects.all().select_related(
            'member', 'book', 'book__genre'
        ).order_by('-created_at')

        # Members only see their own records
        if user.role == 'MEMBER':
            return base.filter(member=user)

        # Staff see everything
        return base


class BorrowRecordDetailAPIView(generics.RetrieveAPIView):
    serializer_class   = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = BorrowRecord.objects.all().select_related(
            'member', 'book', 'book__genre'
        )

        if user.role == 'MEMBER':
            return base.filter(member=user)

        return base


class BorrowRequestAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_pk):
        if not request.user.is_member:
            return Response(
                {'detail': 'Only members can request books.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user = request.user
        book = get_object_or_404(Book, pk=book_pk)

        if not book.is_available:
            return Response(
                {'detail': 'No copies available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing = BorrowRecord.objects.filter(
            member=user,
            book=book,
            status__in=[
                BorrowRecord.Status.REQUESTED,
                BorrowRecord.Status.APPROVED,
                BorrowRecord.Status.BORROWED,
            ]
        ).exists()

        if existing:
            return Response(
                {'detail': 'You already have an active request for this book.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record     = BorrowRecord.objects.create(member=user, book=book)
        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApproveRequestAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status != BorrowRecord.Status.REQUESTED:
            return Response(
                {'detail': 'Only REQUESTED records can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.approve(librarian=request.user)

        try:
            from core.emails import send_borrow_approved_email
            send_borrow_approved_email(record)
        except Exception:
            pass

        return Response(BorrowRecordSerializer(record).data)


class RejectRequestAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        note = request.data.get('note', '')
        record.reject(librarian=request.user, note=note)

        try:
            from core.emails import send_borrow_rejected_email
            send_borrow_rejected_email(record)
        except Exception:
            pass

        return Response(BorrowRecordSerializer(record).data)


class MarkBorrowedAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status != BorrowRecord.Status.APPROVED:
            return Response(
                {'detail': 'Only APPROVED records can be marked borrowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.mark_borrowed()
        return Response(BorrowRecordSerializer(record).data)


class MarkReturnedAPIView(APIView):
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status not in [
            BorrowRecord.Status.BORROWED,
            BorrowRecord.Status.OVERDUE,
        ]:
            return Response(
                {'detail': 'Only BORROWED or OVERDUE can be returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.mark_returned()
        return Response(BorrowRecordSerializer(record).data)