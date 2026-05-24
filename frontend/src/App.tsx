// App.tsx — defines all routes in the application
// Route structure:
//
// /                     → redirect to dashboard
// /login                → Login page (public only)
// /register             → Register page (public only)
//
// Protected routes (must be logged in):
// /dashboard            → Dashboard (all roles)
// /books                → Book list (all roles)
// /books/:id            → Book detail (all roles)
// /books/add            → Add book (librarian, admin)
// /books/:id/edit       → Edit book (librarian, admin)
// /my-borrows           → My borrows (member only)
// /borrow-requests      → Borrow requests (librarian, admin)
// /my-fines             → My fines (member only)
// /fines                → Fines management (librarian, admin)
// /members              → Members list (librarian, admin)
// /members/:id          → Member detail (librarian, admin)

import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

// Routing guards
import ProtectedRoute from './components/routing/ProtectedRoute'
import PublicRoute from './components/routing/PublicRoute'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Main pages
import Dashboard from './pages/dashboard/Dashboard'

// Book pages
import BookList from './pages/books/BookList'
import BookDetail from './pages/books/BookDetail'
import BookForm from './pages/books/BookForm'

// Borrowing pages
import MyBorrows from './pages/borrowing/MyBorrows'
import BorrowRequests from './pages/borrowing/BorrowRequests'

// Fine pages
import MyFines from './pages/fines/MyFines'
import FinesManagement from './pages/fines/FinesManagement'

// Member pages
import MembersList from './pages/members/MembersList'
import MemberDetail from './pages/members/MemberDetail'

// 404
import NotFound from './pages/NotFound'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================================================
            ROOT — redirect to dashboard
        ============================================================ */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ============================================================
            PUBLIC ROUTES — only accessible when NOT logged in
            PublicRoute redirects to /dashboard if already logged in
        ============================================================ */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ============================================================
            PROTECTED ROUTES — must be logged in
            No role restriction — all authenticated users
        ============================================================ */}
        <Route element={<ProtectedRoute />}>

          {/* Dashboard — all roles */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Books — all roles can view */}
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Member only routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['MEMBER']} />
          }>
            <Route path="/my-borrows" element={<MyBorrows />} />
            <Route path="/my-fines" element={<MyFines />} />
          </Route>

          {/* Librarian and Admin only routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']} />
          }>
            <Route path="/books/add" element={<BookForm />} />
            <Route path="/books/:id/edit" element={<BookForm />} />
            <Route path="/borrow-requests" element={<BorrowRequests />} />
            <Route path="/fines" element={<FinesManagement />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/members/:id" element={<MemberDetail />} />
          </Route>

          {/* Admin only routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['ADMIN']} />
          }>
            {/* Add admin-only routes here as needed */}
          </Route>

        </Route>

        {/* ============================================================
            404 — catch all unmatched routes
        ============================================================ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App