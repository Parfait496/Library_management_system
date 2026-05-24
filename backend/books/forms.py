from django import forms
from .models import Book, Genre


class BookForm(forms.ModelForm):
    

    class Meta:
        model = Book
        
        fields = (
            'isbn',
            'title',
            'author',
            'publisher',
            'publication_year',
            'genre',
            'description',
            'total_copies',
            'cover_image',
        )

        # widgets control how each field renders in HTML
        widgets = {
            'isbn': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 9780743273565'
            }),
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Book title'
            }),
            'author': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Author full name'
            }),
            'publisher': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Publisher name'
            }),
            'publication_year': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g. 2023'
            }),
            # Select dropdown for genre
            'genre': forms.Select(attrs={
                'class': 'form-select'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Brief description of the book'
            }),
            'total_copies': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Number of copies'
            }),
            'cover_image': forms.FileInput(attrs={
                'class': 'form-control'
            }),
        }


class GenreForm(forms.ModelForm):

    class Meta:
        model = Genre
        fields = ('name', 'description')
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Genre name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Brief description'
            }),
        }