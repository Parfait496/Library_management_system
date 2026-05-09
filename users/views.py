from django.shortcuts import render, redirect
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
    user = request.user

    context = {
        'user': user,
        'is_admin': user.is_admin,
        'is_librarian': user.is_librarian,
        'is_member': user.is_member,
    }
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
