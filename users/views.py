from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .forms import RegisterForm, LoginForm, UpdateProfileForm



from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer
)

User = get_user_model()

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class ChangePasswordAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            if not user.check_password(
                serializer.validated_data['old_password']
            ):
                return Response(
                    {"old_password": "Incorrect password."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response(
                {"message": "Password Changed successfully."},
                status=status.HTTP_200_OK
            )
        
        return Response (serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']

            token = RefreshToken(refresh_token)

            token.blacklist()

            return Response(
                {"message": "Logged out successfully."},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST
            )


# TEMPLATE VIEWS

def register_view(request):

    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save()
            login(request, user)

            messages.success(request, f'Welcome {user.first_name}! Your account has been created.')
            return redirect('dashboard')
        
        else:
            messages.error(request, 'Please correct the errors below.')

    else:
        form = RegisterForm()

    return render(request, 'users/register.html', {'form': form})

def login_view(request):
    
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')

            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')

    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})

def logout_view(request):
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'You have been logged out.')
    return redirect('login')


@login_required
def dashboard_view(request):

    from books.models import Book, Genre
    from borrowing.models import BorrowRecord
    from fines.models import Fine
    from django.utils import timezone

    user = request.user
    context = {'title': 'Dashboard'}

    
    # ADMIN DASHBOARD DATA
    
    if user.is_admin:
        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Count all users by role
        # filter() with keyword arguments queries the database
        total_users      = User.objects.count()
        total_members    = User.objects.filter(role='MEMBER').count()
        total_librarians = User.objects.filter(role='LIBRARIAN').count()

        # Count books
        total_books      = Book.objects.count()
        total_copies     = sum(
            Book.objects.values_list('total_copies', flat=True)
        )

        # Count borrow records by status
        # Using the Status choices we defined on BorrowRecord
        pending_requests = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.REQUESTED
        ).count()

        active_loans = BorrowRecord.objects.filter(
            status__in=[
                BorrowRecord.Status.BORROWED,
                BorrowRecord.Status.OVERDUE,
            ]
        ).count()

        # Count overdue records
        overdue_loans = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.OVERDUE
        ).count()

        # Count unpaid fines and total amount owed
        unpaid_fines = Fine.objects.filter(
            status=Fine.Status.UNPAID
        )
        unpaid_fines_count  = unpaid_fines.count()

        # aggregate() runs SQL SUM — more efficient than Python sum()
        from django.db.models import Sum
        unpaid_fines_total = unpaid_fines.aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Recent borrow requests (last 5)
        recent_requests = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.REQUESTED
        ).select_related('member', 'book').order_by('-request_date')[:5]

        context.update({
            'total_users':        total_users,
            'total_members':      total_members,
            'total_librarians':   total_librarians,
            'total_books':        total_books,
            'total_copies':       total_copies,
            'pending_requests':   pending_requests,
            'active_loans':       active_loans,
            'overdue_loans':      overdue_loans,
            'unpaid_fines_count': unpaid_fines_count,
            'unpaid_fines_total': unpaid_fines_total,
            'recent_requests':    recent_requests,
        })

    
    # LIBRARIAN DASHBOARD DATA
    
    elif user.is_librarian:

        # Pending requests waiting for librarian action
        pending_requests = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.REQUESTED
        ).count()

        # Approved but not yet picked up
        approved_requests = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.APPROVED
        ).count()

        # Currently borrowed books
        active_loans = BorrowRecord.objects.filter(
            status__in=[
                BorrowRecord.Status.BORROWED,
                BorrowRecord.Status.OVERDUE,
            ]
        ).count()

        # Overdue books
        overdue_loans = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.OVERDUE
        ).count()

        # Total books in catalogue
        total_books = Book.objects.count()

        # Unpaid fines count
        unpaid_fines_count = Fine.objects.filter(
            status=Fine.Status.UNPAID
        ).count()

        # Most recent 5 pending requests to show in the table
        recent_pending = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.REQUESTED
        ).select_related('member', 'book').order_by('-request_date')[:5]

        # Most recent 5 overdue loans
        recent_overdue = BorrowRecord.objects.filter(
            status=BorrowRecord.Status.OVERDUE
        ).select_related('member', 'book').order_by('due_date')[:5]

        context.update({
            'pending_requests':   pending_requests,
            'approved_requests':  approved_requests,
            'active_loans':       active_loans,
            'overdue_loans':      overdue_loans,
            'total_books':        total_books,
            'unpaid_fines_count': unpaid_fines_count,
            'recent_pending':     recent_pending,
            'recent_overdue':     recent_overdue,
        })

  
    # MEMBER DASHBOARD DATA
    
    else:
        # Get this member's borrow records
        my_records = BorrowRecord.objects.filter(
            member=user
        ).select_related('book')

        # Active loans (currently borrowed)
        my_active = my_records.filter(
            status__in=[
                BorrowRecord.Status.BORROWED,
                BorrowRecord.Status.OVERDUE,
            ]
        )

        # Pending requests waiting for approval
        my_pending = my_records.filter(
            status=BorrowRecord.Status.REQUESTED
        ).count()

        # Total books borrowed ever
        my_total_borrowed = my_records.filter(
            status=BorrowRecord.Status.RETURNED
        ).count()

        # Overdue books
        my_overdue = my_records.filter(
            status=BorrowRecord.Status.OVERDUE
        )

        # Unpaid fines
        from fines.models import Fine
        from django.db.models import Sum
        my_unpaid_fines = Fine.objects.filter(
            member=user,
            status=Fine.Status.UNPAID
        )
        my_fines_total = my_unpaid_fines.aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Recently borrowed books (last 3) for the dashboard table
        recent_borrows = my_records.order_by('-created_at')[:3]

        context.update({
            'my_active':        my_active,
            'my_active_count':  my_active.count(),
            'my_pending':       my_pending,
            'my_total_borrowed': my_total_borrowed,
            'my_overdue_count': my_overdue.count(),
            'my_fines_total':   my_fines_total,
            'recent_borrows':   recent_borrows,
            'today':            timezone.now().date(),
        })

    return render(request, 'dashboard.html', context)

@login_required
def profile_view(request):

    if request.method == 'POST':
        form = UpdateProfileForm(
            request.POST,
            request.FILES,   # request.FILES needed for image uploads
            instance=request.user
        )

        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully.')
            return redirect('profile')
        else:
            messages.error(request, 'Please correct the errors below.')

    else:
        form = UpdateProfileForm(instance=request.user)

    return render(request, 'users/profile.html', {'form': form})

@login_required
def members_list_view(request):
    

    # Only librarians and admins can access this page
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    # Get all members
    members = User.objects.filter(role='MEMBER').order_by('date_joined')

    # Search by username, name, or email
    search_query = request.GET.get('search', '')
    if search_query:
        from django.db.models import Q
        members = members.filter(
            Q(username__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )

    # Annotate each member with their borrow counts
    # annotate() adds extra computed fields to each object
    # Count() counts related objects
    from django.db.models import Count, Q as DQ
    from borrowing.models import BorrowRecord

    members = members.annotate(
        # Total borrow records ever
        total_borrows=Count('borrow_records'),

        # Active loans count
        active_borrows=Count(
            'borrow_records',
            filter=DQ(borrow_records__status__in=[
                'BORROWED', 'OVERDUE'
            ])
        ),

        # Overdue count
        overdue_count=Count(
            'borrow_records',
            filter=DQ(borrow_records__status='OVERDUE')
        ),
    )

    context = {
        'members': members,
        'search_query': search_query,
        'title': 'Members',
    }
    return render(request, 'users/members_list.html', context)


@login_required
def member_detail_view(request, pk):
    
    if not (request.user.is_librarian or request.user.is_admin):
        messages.error(request, 'Access denied.')
        return redirect('dashboard')

    # Get the member — must be a MEMBER role user
    member = get_object_or_404(User, pk=pk, role='MEMBER')

    # Get their borrow records
    from borrowing.models import BorrowRecord
    from fines.models import Fine
    from django.db.models import Sum

    borrow_records = BorrowRecord.objects.filter(
        member=member
    ).select_related('book').order_by('-created_at')

    # Split into active and history
    active_loans = borrow_records.filter(
        status__in=['BORROWED', 'OVERDUE', 'APPROVED', 'REQUESTED']
    )
    borrow_history = borrow_records.filter(
        status__in=['RETURNED', 'REJECTED']
    )

    # Fines summary
    fines = Fine.objects.filter(member=member)
    unpaid_fines = fines.filter(status=Fine.Status.UNPAID)
    total_unpaid = unpaid_fines.aggregate(
        total=Sum('amount')
    )['total'] or 0

    context = {
        'member': member,
        'active_loans': active_loans,
        'borrow_history': borrow_history,
        'fines': fines,
        'unpaid_fines_count': unpaid_fines.count(),
        'total_unpaid': total_unpaid,
        'title': f'Member: {member.username}',
    }
    return render(request, 'users/member_detail.html', context)
