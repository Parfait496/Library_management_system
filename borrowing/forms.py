from django import forms
from .models import BorrowRecord


class BorrowRequestForm(forms.ModelForm):
    
    class Meta:
        model = BorrowRecord

        fields = []  # empty — everything is set in the view


class ProcessRequestForm(forms.Form):
    

    ACTION_CHOICES = [
        ('approve', 'Approve'),
        ('reject', 'Reject'),
    ]

    action = forms.ChoiceField(
        choices=ACTION_CHOICES,
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )

    
    librarian_note = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Optional note to the member...'
        })
    )