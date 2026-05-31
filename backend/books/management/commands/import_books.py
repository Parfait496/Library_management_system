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
        parser.add_argument('--library', type=str, default=None, help='Library slug')

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
                    # Get or create genre
                    genre = None
                    if row.get('genre'):
                        genre, _ = Genre.objects.get_or_create(
                            name=row['genre'].strip()
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