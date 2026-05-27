# emails.py — all email functions for the library system
# Uses Django's built-in email system
# Set EMAIL_BACKEND in .env to control where emails go:
#   console  → prints to terminal (development)
#   smtp     → actually sends (production)

import secrets
from django.core.mail import send_mail
from django.conf import settings


def generate_verification_token():
    """Generate a secure random 6-digit verification code"""
    return str(secrets.randbelow(900000) + 100000)  # 100000-999999


def send_verification_email(user):
    """
    Sends a 6-digit verification code to the user's email.
    Called right after registration.
    The user enters this code to verify their email.
    """
    # Generate and save the token
    token = generate_verification_token()
    user.email_verification_token = token
    user.save(update_fields=['email_verification_token'])

    subject = 'Verify your Library account — your code is inside'
    message = f"""
Hi {user.first_name or user.username},

Welcome to the Library Management System!

Your email verification code is:

    {token}

Enter this code on the verification page to activate your account.

This code does not expire but you can request a new one if needed.

If you did not create this account, please ignore this email.

Library Team
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email error (verification): {e}")
        return False


def send_welcome_email(user):
    """
    Sent after email is verified.
    Explains how the library works.
    """
    subject = 'Your Library account is ready!'
    message = f"""
Hi {user.first_name or user.username},

Your email has been verified and your account is now active.

Here's how the library works:
  1. Browse books at {settings.FRONTEND_URL}/books
  2. Request to borrow a book
  3. A librarian will approve your request
  4. Pick up the book from the library
  5. Return it within 14 days to avoid fines

Fine rate: 100 RWF per day overdue.

Happy reading!
Library Team
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error (welcome): {e}")


def send_borrow_approved_email(borrow_record):
    """Sent when librarian approves a borrow request"""
    user = borrow_record.member
    book = borrow_record.book

    subject = f'Approved: "{book.title}" is ready for pickup'
    message = f"""
Hi {user.first_name or user.username},

Your request to borrow "{book.title}" by {book.author} has been approved!

Please come to the library to pick up your book.
You will have 14 days from pickup to return it.
Fine rate: 100 RWF per day overdue.

Library Team
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error (approved): {e}")


def send_borrow_rejected_email(borrow_record):
    """Sent when librarian rejects a borrow request"""
    user = borrow_record.member
    book = borrow_record.book
    note = borrow_record.librarian_note or 'No reason provided.'

    subject = f'Request update: "{book.title}"'
    message = f"""
Hi {user.first_name or user.username},

Your request to borrow "{book.title}" was not approved.

Reason: {note}

You can browse other available books at {settings.FRONTEND_URL}/books

Library Team
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error (rejected): {e}")


def send_overdue_reminder_email(borrow_record):
    """Sent when a book is overdue"""
    user = borrow_record.member
    book = borrow_record.book

    subject = f'Overdue notice: Please return "{book.title}"'
    message = f"""
Hi {user.first_name or user.username},

"{book.title}" was due on {borrow_record.due_date}
and is now {borrow_record.days_overdue} day(s) overdue.

Current fine: {borrow_record.fine_amount} RWF
Fine rate: 100 RWF per day

Please return the book as soon as possible.

Library Team
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error (overdue): {e}")


def send_weekly_new_books_email(users, new_books):
    """Sent every week listing new books added to the library"""
    if not new_books:
        return

    book_list = '\n'.join([
        f"  • {b.title} by {b.author}"
        f" [{b.genre.name if b.genre else 'No genre'}]"
        for b in new_books
    ])

    subject = f'New this week: {len(new_books)} book(s) added to the library!'
    message = f"""
Hello,

Here are the new books added to our library this week:

{book_list}

Browse and request at: {settings.FRONTEND_URL}/books

Happy reading!
Library Team
    """

    for user in users:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email error (weekly for {user.email}): {e}")