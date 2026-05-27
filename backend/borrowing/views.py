from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BorrowRecord
from .serializers import BorrowRecordSerializer
from books.models import Book


class IsLibrarianOrAdmin(permissions.BasePermission):
    """Only librarians and admins can access"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['LIBRARIAN', 'ADMIN']
        )


class BorrowRecordListAPIView(generics.ListAPIView):
    """
    GET /api/borrowing/
    Librarians and admins see all records.
    Members see only their own records.
    """
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return BorrowRecord.objects.all().select_related(
                'member', 'book', 'book__genre'
            ).order_by('-created_at')
        return BorrowRecord.objects.filter(
            member=user
        ).select_related(
            'member', 'book', 'book__genre'
        ).order_by('-created_at')


class BorrowRecordDetailAPIView(generics.RetrieveAPIView):
    """GET /api/borrowing/<id>/"""
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['LIBRARIAN', 'ADMIN']:
            return BorrowRecord.objects.all()
        return BorrowRecord.objects.filter(member=user)


class BorrowRequestAPIView(APIView):
    """POST /api/borrowing/request/<book_pk>/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, book_pk):
        if not request.user.is_member:
            return Response(
                {'detail': 'Only members can request books.'},
                status=status.HTTP_403_FORBIDDEN
            )

        book = get_object_or_404(Book, pk=book_pk)

        if not book.is_available:
            return Response(
                {'detail': 'No copies available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
            return Response(
                {'detail': 'You already have an active request for this book.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record = BorrowRecord.objects.create(
            member=request.user,
            book=book,
        )
        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApproveRequestAPIView(APIView):
    """POST /api/borrowing/<pk>/approve/"""
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status != BorrowRecord.Status.REQUESTED:
            return Response(
                {'detail': 'Only REQUESTED records can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.approve(librarian=request.user)

        # Send approval email notification
        from core.emails import send_borrow_approved_email
        send_borrow_approved_email(record)

        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data)


class RejectRequestAPIView(APIView):
    """POST /api/borrowing/<pk>/reject/"""
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)
        note = request.data.get('note', '')
        record.reject(librarian=request.user, note=note)

        # Send rejection email notification
        from core.emails import send_borrow_rejected_email
        send_borrow_rejected_email(record)

        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data)


class MarkBorrowedAPIView(APIView):
    """POST /api/borrowing/<pk>/mark-borrowed/"""
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status != BorrowRecord.Status.APPROVED:
            return Response(
                {'detail': 'Only APPROVED records can be marked as borrowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.mark_borrowed()
        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data)


class MarkReturnedAPIView(APIView):
    """POST /api/borrowing/<pk>/mark-returned/"""
    permission_classes = [IsLibrarianOrAdmin]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.status not in [
            BorrowRecord.Status.BORROWED,
            BorrowRecord.Status.OVERDUE,
        ]:
            return Response(
                {'detail': 'Only BORROWED or OVERDUE records can be returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.mark_returned()
        serializer = BorrowRecordSerializer(record)
        return Response(serializer.data)