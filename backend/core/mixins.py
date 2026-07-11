# core/mixins.py
# Single source of truth for library filtering
# Import this in all app views


class LibraryFilterMixin:
    """
    Filters querysets by the user's library.

    Rules:
    - ADMIN with no library → sees ALL data (super admin)
    - ADMIN with library    → sees only their library
    - LIBRARIAN             → sees only their library
    - MEMBER                → sees only their library

    Usage in views:
        def get_queryset(self):
            base = MyModel.objects.all()
            return self.get_library_queryset(base)
    """

    def get_library_queryset(self, queryset, library_field='library'):
        """
        library_field: the field name on the model that links to Library
        For nested lookups use double underscore:
          e.g. 'book__library' for BorrowRecord
               'borrow_record__book__library' for Fine
        """
        user = self.request.user

        # Super admin with no library — sees everything
        if user.role == 'ADMIN' and not getattr(user, 'library', None):
            return queryset

        # Get user's library
        library = getattr(user, 'library', None)

        if library:
            return queryset.filter(**{library_field: library})

        # No library assigned — sees nothing
        return queryset.none()