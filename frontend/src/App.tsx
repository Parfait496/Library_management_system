import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/routing/ProtectedRoute'
import PublicRoute from './components/routing/PublicRoute'
import Layout from './components/layout/Layout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/dashboard/Dashboard'
import BookList from './pages/books/BookList'
import BookDetail from './pages/books/BookDetail'
import BookForm from './pages/books/BookForm'
import GenreManagement from './pages/books/GenreManagement'
import BookSuggestion from './pages/books/BookSuggestion'
import MyBorrows from './pages/borrowing/MyBorrows'
import BorrowRequests from './pages/borrowing/BorrowRequests'
import MyFines from './pages/fines/MyFines'
import FinesManagement from './pages/fines/FinesManagement'
import MembersList from './pages/members/MembersList'
import MemberDetail from './pages/members/MemberDetail'
import MyProfile from './pages/profile/MyProfile'
import NotFound from './pages/NotFound'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing page — public */}
        <Route path="/" element={<Landing />} />

        {/* Public auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* All roles */}
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/books"       element={<BookList />} />
            <Route path="/books/:id"   element={<BookDetail />} />
            <Route path="/suggestions" element={<BookSuggestion />} />
            <Route path="/profile"     element={<MyProfile />} />

            {/* Member only */}
            <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
              <Route path="/my-borrows" element={<MyBorrows />} />
              <Route path="/my-fines"   element={<MyFines />} />
            </Route>

            {/* Librarian and Admin */}
            <Route element={
              <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']} />
            }>
              <Route path="/books/add"        element={<BookForm />} />
              <Route path="/books/:id/edit"   element={<BookForm />} />
              <Route path="/borrow-requests"  element={<BorrowRequests />} />
              <Route path="/fines"            element={<FinesManagement />} />
              <Route path="/members"          element={<MembersList />} />
              <Route path="/members/:id"      element={<MemberDetail />} />
              <Route path="/genres"           element={<GenreManagement />} />
            </Route>

          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App