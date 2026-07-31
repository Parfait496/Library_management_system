import csv
import os
from django.core.management.base import BaseCommand
from books.models import Book, Genre
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Import books from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        csv_path = options['csv_file']

        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f'File not found: {csv_path}'))
            return

        created = 0
        skipped = 0
        errors  = 0

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                try:
                    # Get or create genre, with optional parent category
                    # CSV can provide:
                    #   category = top-level, e.g. "Medical Sciences"
                    #   genre    = subcategory, e.g. "Anatomy"
                    genre = None
                    genre_name    = (row.get('genre') or '').strip()
                    category_name = (row.get('category') or '').strip()

                    if genre_name:
                        parent = None
                        if category_name:
                            parent, _ = Genre.objects.get_or_create(
                                name=category_name, parent=None
                            )
                        genre, _ = Genre.objects.get_or_create(
                            name=genre_name, parent=parent
                        )
                    elif category_name:
                        genre, _ = Genre.objects.get_or_create(
                            name=category_name, parent=None
                        )

                    # Skip if ISBN already exists
                    isbn = row.get('isbn', '').strip()
                    if isbn and Book.objects.filter(isbn=isbn).exists():
                        skipped += 1
                        continue

                    Book.objects.create(
                        isbn=isbn or f'AUTO-{created}',
                        title=row.get('title', '').strip(),
                        author=row.get('author', '').strip(),
                        publisher=row.get('publisher', '').strip(),
                        publication_year=int(row['year']) if row.get('year') else None,
                        genre=genre,
                        description=row.get('description', '').strip(),
                        total_copies=int(row.get('copies', 1)),
                        available_copies=int(row.get('copies', 1)),
                    )
                    created += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error on row {reader.line_num}: {e}')
                    )
                    errors += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done! Created: {created}, Skipped: {skipped}, Errors: {errors}'
        ))