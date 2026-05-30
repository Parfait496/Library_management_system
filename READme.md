# 📚 Library Management System

> A modern, full-stack library management system that helps libraries
> manage books, members, borrowing, and fines — all in one place.
>
> Built by **Parfait Ndizihiwe** as a project.

---

## 🌐 Live Links

| Service | URL |
|---|---|
| 🌍 Frontend (Netlify) | https://libraryms-780009.netlify.app/ |
| ⚙️ Backend API (Railway) | https://librarymanagementsystem-production-7ecf.up.railway.app/api/ |
| 🔐 Django Admin | https://librarymanagementsystem-production-7ecf.up.railway.app/admin/ |
| ❤️ Health Check | https://librarymanagementsystem-production-7ecf.up.railway.app/health/ |

---

## 📖 What is this?

This is a **Library Management System** — a web application that helps libraries
manage their day-to-day operations digitally instead of using pen and paper.

### The Problem It Solves

Public and institutional libraries struggle with:
- ❌ Losing track of which books are available
- ❌ Not knowing who has which book
- ❌ Manual tracking of overdue books and fines
- ❌ Disorganized member records

### The Solution

LibraryMS provides:
- ✅ A digital catalogue of all books
- ✅ A complete borrowing system from request to return
- ✅ Automatic overdue detection and fine calculation
- ✅ Member management with borrowing history
- ✅ Email notifications for every important event
- ✅ Role-based access for Admins, Librarians, and Members

---

## 👥 Who Uses It?

There are **3 types of users** in this system:

### 👑 Admin
The boss of the system. Can do everything.
- Manage all users, books, borrowing records, and fines
- Access the Django admin panel
- View all system statistics

### 📚 Librarian
The day-to-day operator of the library.
- Add, edit, and catalogue books with ISBN, author, genre
- Approve or reject member borrow requests
- Mark books as borrowed and returned
- Manage fines (mark paid or waive)
- View all member activity

### 👤 Member
A regular library user.
- Browse and search the book catalogue
- Request to borrow available books
- View their own borrowing history
- Check their outstanding fines
- Suggest books they want the library to buy

---

## 🔄 How Borrowing Works

Every book borrow follows this exact lifecycle:

Member requests a book
↓
REQUESTED
↓
Librarian reviews it
↓
APPROVED ──────── REJECTED
↓
Librarian confirms pickup
↓
BORROWED
↓
Due in 14 days
↓
Member returns book ──── Past due date?
↓                      ↓
RETURNED              OVERDUE
↓
Fine = 100 RWF × days overdue

---

## ✨ Features

### 📚 Books
- Full catalogue with search by title, author, ISBN, or genre
- Book cover image upload
- Track total copies and available copies
- Genre management (add, edit, delete genres)
- Members can suggest books for the library to acquire

### 👤 Users
- JWT authentication (login stays active for 1 hour)
- Email verification after registration (6-digit code)
- Forgot password with email reset code
- Profile page with photo upload
- Role-based access control (Admin, Librarian, Member)

### 📋 Borrowing
- Complete lifecycle from request to return
- Librarian can approve or reject with a note
- Automatic overdue detection
- Fine calculation at 100 RWF per day

### 💰 Fines
- Auto-created when overdue book is returned
- Librarian can mark as paid or waive
- Members can see their total outstanding balance

### 📧 Email Notifications
- Welcome email after email verification
- Approval notification when book request is approved
- Rejection notification with reason
- Overdue reminder email
- Weekly digest of new books added to library

### 🏠 Landing Page
- Beautiful public landing page
- Features, how it works, testimonials
- Contact form

---

## 🛠️ Technology Stack

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11 | Programming language |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | REST API builder |
| SimpleJWT | 5.3 | JWT authentication |
| PostgreSQL | 15 | Database |
| Gunicorn | 21.2 | Production web server |
| WhiteNoise | 6.x | Static file serving |
| python-decouple | 3.8 | Environment variables |
| dj-database-url | 2.x | Database URL parsing |

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type-safe JavaScript |
| Tailwind CSS | 3 | Styling |
| React Router | v6 | Page routing |
| Axios | 1.x | HTTP requests |
| Lucide React | 0.383 | Icons |

### DevOps
| Tool | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local multi-service setup |
| GitHub Actions | CI/CD pipeline |
| Railway | Backend cloud hosting |
| Netlify | Frontend cloud hosting |

---

## 📁 Project Structure

library-management-system/
│
├── backend/                        # Django REST API
│   ├── core/                       # Project settings and URLs
│   │   ├── settings.py             # All Django configuration
│   │   ├── urls.py                 # Root URL routing
│   │   ├── wsgi.py                 # WSGI entry point
│   │   └── emails.py              # Email notification functions
│   │
│   ├── users/                      # User management app
│   │   ├── models.py               # Custom User model with roles
│   │   ├── serializers.py          # User data serializers
│   │   ├── views.py                # Auth and user API views
│   │   ├── urls.py                 # User URL routes
│   │   └── management/
│   │       └── commands/
│   │           └── create_superuser.py  # Auto-create admin
│   │
│   ├── books/                      # Books management app
│   │   ├── models.py               # Book, Genre, BookSuggestion
│   │   ├── serializers.py          # Book data serializers
│   │   ├── views.py                # Book API views
│   │   └── urls.py                 # Book URL routes
│   │
│   ├── borrowing/                  # Borrowing lifecycle app
│   │   ├── models.py               # BorrowRecord model
│   │   ├── serializers.py          # Borrow data serializers
│   │   ├── views.py                # Borrow API views
│   │   └── urls.py                 # Borrow URL routes
│   │
│   ├── fines/                      # Fines management app
│   │   ├── models.py               # Fine model
│   │   ├── serializers.py          # Fine data serializers
│   │   ├── views.py                # Fine API views
│   │   └── urls.py                 # Fine URL routes
│   │
│   ├── Dockerfile                  # Backend container definition
│   ├── requirements.txt            # Python dependencies
│   ├── manage.py                   # Django management script
│   └── .env                        # Environment variables (never commit!)
│
├── frontend/                       # React TypeScript app
│   ├── src/
│   │   ├── api/                    # Axios API call functions
│   │   │   ├── axios.ts            # Axios instance with JWT
│   │   │   ├── auth.ts             # Login, register, logout
│   │   │   ├── books.ts            # Book CRUD calls
│   │   │   ├── borrowing.ts        # Borrow lifecycle calls
│   │   │   ├── fines.ts            # Fine management calls
│   │   │   └── users.ts            # User and member calls
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Button, Input, Badge, Alert...
│   │   │   ├── layout/             # Navbar, Layout, Footer
│   │   │   └── routing/            # ProtectedRoute, PublicRoute
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Global auth state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Auth hook
│   │   │   └── useApi.ts           # Generic API hook
│   │   │
│   │   ├── pages/                  # Page components
│   │   │   ├── Landing.tsx         # Public landing page
│   │   │   ├── auth/               # Login, Register, Verify, Forgot
│   │   │   ├── dashboard/          # Role-based dashboard
│   │   │   ├── books/              # Book list, detail, form
│   │   │   ├── borrowing/          # My borrows, requests
│   │   │   ├── fines/              # My fines, management
│   │   │   ├── members/            # Members list and detail
│   │   │   └── profile/            # My profile page
│   │   │
│   │   ├── types/
│   │   │   └── index.ts            # All TypeScript interfaces
│   │   │
│   │   └── utils/
│   │       ├── constants.ts        # App constants
│   │       └── helpers.ts          # Date formatting, etc.
│   │
│   ├── public/
│   │   └── _redirects              # Netlify routing fix
│   ├── Dockerfile                  # Frontend container
│   ├── netlify.toml                # Netlify build config
│   └── .env                        # Frontend env variables
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD
│
├── docker-compose.yml              # Local development setup
└── README.md                       # This file


---

## 🚀 Getting Started Locally

> **Requirements:** Docker Desktop installed and running on your computer.
> Download from [docker.com](https://www.docker.com/products/docker-desktop)

### Step 1 — Clone the repository

```bash
git clone https://github.com/Parfait496/Library_management_system.git
cd Library_management_system
```

### Step 2 — Create environment file

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
SECRET_KEY=any-long-random-string-here-change-this
DEBUG=True
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=db
DB_PORT=5432
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@library.com
DJANGO_SUPERUSER_PASSWORD=Admin123!
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
FRONTEND_URL=http://localhost:3000
```

Also create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3 — Start the application

```bash
docker-compose up --build
```

> First time takes 5-10 minutes to download everything.
> After that it starts in under 1 minute.

### Step 4 — Open in browser

| Service | URL |
|---|---|
| 🌍 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000/api/ |
| 🔐 Django Admin | http://localhost:8000/admin/ |

### Step 5 — Login

The admin user is created automatically. Login at `http://localhost:3000/login`:

Username: admin
Password: Admin123!

To register as a Member go to `http://localhost:3000/register`

---

## 📡 API Reference

All API endpoints are prefixed with `/api/`

### 🔐 Authentication Endpoints

| Method | URL | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register/` | Register new member | No |
| POST | `/api/auth/login/` | Login (returns JWT tokens) | No |
| POST | `/api/auth/refresh/` | Refresh access token | No |
| POST | `/api/auth/logout/` | Logout (blacklists token) | Yes |
| POST | `/api/auth/verify-email/` | Verify email with 6-digit code | No |
| POST | `/api/auth/resend-verification/` | Resend verification code | No |
| POST | `/api/auth/forgot-password/` | Send password reset code | No |
| POST | `/api/auth/reset-password/` | Reset password with code | No |

### 👤 User Endpoints

| Method | URL | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users/profile/` | Get your own profile | Yes |
| PATCH | `/api/users/profile/` | Update your profile | Yes |
| POST | `/api/users/change-password/` | Change password | Yes |
| GET | `/api/users/members/` | List all members | Librarian/Admin |
| GET | `/api/users/members/<id>/` | Get member detail | Librarian/Admin |

### 📚 Book Endpoints

| Method | URL | Description | Auth Required |
|---|---|---|---|
| GET | `/api/books/` | List all books (search & filter) | Yes |
| POST | `/api/books/` | Add new book | Librarian/Admin |
| GET | `/api/books/<id>/` | Get book detail | Yes |
| PATCH | `/api/books/<id>/` | Update book | Librarian/Admin |
| DELETE | `/api/books/<id>/` | Delete book | Admin |
| GET | `/api/genres/` | List all genres | Yes |
| POST | `/api/genres/` | Create genre | Librarian/Admin |
| GET | `/api/books/suggestions/` | List suggestions | Yes |
| POST | `/api/books/suggestions/` | Submit suggestion | Member |

### 📋 Borrowing Endpoints

| Method | URL | Description | Auth Required |
|---|---|---|---|
| GET | `/api/borrowing/` | List borrow records | Yes |
| POST | `/api/borrowing/request/<book_id>/` | Request to borrow | Member |
| POST | `/api/borrowing/<id>/approve/` | Approve request | Librarian/Admin |
| POST | `/api/borrowing/<id>/reject/` | Reject request | Librarian/Admin |
| POST | `/api/borrowing/<id>/mark-borrowed/` | Mark as borrowed | Librarian/Admin |
| POST | `/api/borrowing/<id>/mark-returned/` | Mark as returned | Librarian/Admin |

### 💰 Fine Endpoints

| Method | URL | Description | Auth Required |
|---|---|---|---|
| GET | `/api/fines/` | List fines | Yes |
| GET | `/api/fines/<id>/` | Get fine detail | Yes |
| POST | `/api/fines/<id>/resolve/` | Mark paid or waive | Librarian/Admin |
| GET | `/api/fines/summary/` | Get my fines summary | Yes |

---

## 🧪 Running Tests

```bash
# Run all 15 tests
docker-compose exec backend python manage.py test --verbosity=2

# Run tests for one app only
docker-compose exec backend python manage.py test users
docker-compose exec backend python manage.py test books
docker-compose exec backend python manage.py test borrowing
docker-compose exec backend python manage.py test fines
```

### What is tested

| Test | App | What it checks |
|---|---|---|
| User role properties | users | is_admin, is_librarian, is_member return correct values |
| Default role is MEMBER | users | New users always get MEMBER role |
| User string representation | users | __str__ format is correct |
| JWT login returns tokens | users | Login gives back access + refresh tokens |
| Unauthenticated blocks profile | users | No token = 401 Unauthorized |
| Authenticated accesses profile | users | Valid token = 200 OK |
| Book availability | books | is_available and availability_status work |
| Book string representation | books | __str__ format is correct |
| Member cannot create book | books | Members get 403 Forbidden |
| Librarian can create book | books | Librarians get 201 Created |
| Borrow lifecycle | borrowing | Full REQUESTED → RETURNED flow |
| Overdue detection | borrowing | Past due date = is_overdue True |
| Reject request | borrowing | Rejection does not affect copies |
| Fine auto-created | fines | Returning overdue book creates fine |
| Fine mark paid | fines | Librarian can mark fine as paid |

---

## 🔧 Useful Commands

```bash
# ── Docker Commands ────────────────────────────────────────────
# Start everything (first time or after changes)
docker-compose up --build

# Start without rebuilding (faster)
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Stop and delete ALL data (fresh start)
docker-compose down -v

# ── View Logs ─────────────────────────────────────────────────
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# ── Django Management Commands ────────────────────────────────
# Run database migrations
docker-compose exec backend python manage.py migrate

# Create a new admin user manually
docker-compose exec backend python manage.py createsuperuser

# Check for overdue books and send reminder emails
docker-compose exec backend python manage.py check_overdue

# Send weekly new books digest to all members
docker-compose exec backend python manage.py send_weekly_digest

# Open Django Python shell
docker-compose exec backend python manage.py shell
```

---

## 🚢 Deployment Guide

### Backend → Railway

**1.** Go to [railway.app](https://railway.app) → sign in with GitHub

**2.** Click **New Project** → **Add a service** → **Database** → **PostgreSQL**
   - Wait until it says **Active**
   - Click on it → **Variables** tab → copy `DATABASE_URL`

**3.** Click **New** → **GitHub Repo** → select your repo
   - Set **Root Directory** to `backend`

**4.** Go to **Variables** tab → add these:

SECRET_KEY                  → generate with: python -c "import secrets; print(secrets.token_urlsafe(50))"
DEBUG                       → False
DATABASE_URL                → paste from PostgreSQL service
DJANGO_SETTINGS_MODULE      → core.settings
DJANGO_SUPERUSER_USERNAME   → admin
DJANGO_SUPERUSER_EMAIL      → admin@library.com
DJANGO_SUPERUSER_PASSWORD   → Admin@Library2025!
EMAIL_BACKEND               → django.core.mail.backends.console.EmailBackend
FRONTEND_URL                → https://your-netlify-app.netlify.app

**5.** Go to **Settings** → **Networking** → **Generate Domain**
   - Set port to whatever Railway assigns (check logs)

**6.** Click **Deploy** and watch the logs

**7.** Test: `https://your-app.up.railway.app/health/` → should return `{"status": "ok"}`

---

### Frontend → Netlify

**1.** Go to [netlify.com](https://netlify.com) → sign in with GitHub

**2.** Click **Add new site** → **Import an existing project** → **GitHub**
   - Select your repo

**3.** Set build settings:

Base directory:    frontend
Build command:     npm run build
Publish directory: frontend/build

**4.** Add environment variable:

REACT_APP_API_URL → https://your-app.up.railway.app/api

**5.** Click **Deploy site**

**6.** After deploy copy your Netlify URL and update Railway:

FRONTEND_URL         → https://your-app.netlify.app
CORS_ALLOWED_ORIGINS → https://your-app.netlify.app,http://localhost:3000

---

### Setup Email (Gmail)

**1.** Go to your Google Account → Security → enable 2-Step Verification

**2.** Go to App Passwords → create one for "Mail" → copy the 16-character password

**3.** Update Railway variables:

---

### Setup Email (Gmail)

**1.** Go to your Google Account → Security → enable 2-Step Verification

**2.** Go to App Passwords → create one for "Mail" → copy the 16-character password

**3.** Update Railway variables:

EMAIL_BACKEND       → django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST          → smtp.gmail.com
EMAIL_PORT          → 587
EMAIL_USE_TLS       → True
EMAIL_HOST_USER     → your-gmail@gmail.com
EMAIL_HOST_PASSWORD → your-16-char-app-password
DEFAULT_FROM_EMAIL  → LibraryMS your-gmail@gmail.com

---

## 🔄 CI/CD Pipeline

Every time you push code to the `main` branch GitHub Actions automatically:

Push to main
↓
Run 15 backend tests against PostgreSQL
↓
Build React frontend (checks for errors)
↓
Build Docker images (verifies Dockerfile works)
↓
Everything passes = code is safe to deploy

---

## 🔒 Security Features

- **JWT tokens** expire after 60 minutes — auto-refreshed
- **Refresh tokens** expire after 7 days — user must login again
- **Email verification** — 6-digit code sent after registration
- **Password reset** — 6-digit code sent to email
- **Role-based access** — each role can only see/do what is allowed
- **CORS protection** — only allowed origins can call the API
- **Environment variables** — no secrets in the code ever
- **HTTPS** — enforced on Railway and Netlify

---

## 🐛 Troubleshooting

### App not loading locally

```bash
# Check all containers are running
docker-compose ps

# Check for errors
docker-compose logs backend
docker-compose logs frontend

# Fresh start
docker-compose down -v
docker-compose up --build
```

### Cannot login

- Make sure `REACT_APP_API_URL` points to the correct backend URL
- Check browser DevTools → Network tab for the actual error
- Make sure your email is verified (check terminal for the 6-digit code)

### Books not showing

- Make sure you are logged in
- Check the API directly: `https://your-backend.railway.app/api/books/`
- Add some books first through the admin panel

### Admin CSS not loading

```bash
docker-compose exec backend python manage.py collectstatic --noinput --clear
```

### Database errors

```bash
# Reset database completely
docker-compose down -v
docker-compose up --build
```

---

## 📊 Database Models


User
├── username, email, password
├── first_name, last_name
├── role (ADMIN, LIBRARIAN, MEMBER)
├── phone_number, address
├── profile_picture
├── email_verified
└── email_verification_token
Genre
├── name
└── description
Book
├── isbn, title, author
├── publisher, publication_year
├── genre (→ Genre)
├── description
├── total_copies, available_copies
├── cover_image
└── added_by (→ User)
BorrowRecord
├── member (→ User)
├── book (→ Book)
├── status (REQUESTED/APPROVED/REJECTED/BORROWED/RETURNED/OVERDUE)
├── request_date, approved_date
├── borrow_date, due_date, return_date
└── processed_by (→ User)
Fine
├── borrow_record (→ BorrowRecord)
├── member (→ User)
├── amount (RWF)
├── days_overdue
├── status (UNPAID/PAID/WAIVED)
├── issued_date, resolved_date
└── resolved_by (→ User)
BookSuggestion
├── suggested_by (→ User)
├── title, author, isbn
├── reason
├── status (PENDING/REVIEWED/APPROVED/REJECTED)
└── admin_note

---

## 🌟 Future Improvements

These features would make the system even better:

- **Waitlist system** — join a waitlist when a book has no available copies
- **QR codes** — scan QR code to quickly mark a book as borrowed or returned
- **Book ratings** — members rate books after returning them
- **Bulk CSV import** — librarians upload many books at once via CSV
- **Mobile app** — React Native app using the same API
- **Dark mode** — toggle between light and dark theme
- **Kinyarwanda language** — support local language for Rwanda users
- **Real-time notifications** — in-app notifications using WebSockets
- **Borrowing extensions** — members request extra time before due date
- **Analytics reports** — charts showing most borrowed books, peak times, etc.

---

## 👨‍💻 About the Developer

This project was built as a **final project** by:

**Parfait Ndizihiwe**
Medical Student | Software Developer
📍 Kigali, Rwanda

> *"I built this system to solve a real problem I observed in libraries
> around me — the chaos of manual book tracking. Technology should
> make life easier, and this is my contribution."*

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- **Django** and **React** communities for excellent documentation
- **Tailwind CSS** for making the UI beautiful without fighting CSS
- **Railway** and **Netlify** for free hosting tiers
- **Anthropic Claude** for guidance throughout development

---

*© 2025 LibraryMS — Parfait Ndizihiwe. All rights reserved.*