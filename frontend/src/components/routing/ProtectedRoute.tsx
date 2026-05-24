// ProtectedRoute.tsx — wraps routes that require authentication
// If user is not logged in → redirect to login
// If user does not have required role → redirect to dashboard

import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'
import { UserRole } from '../../types'

interface ProtectedRouteProps {
  // Optional — if provided, only users with these roles can access
  allowedRoles?: UserRole[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  // useLocation lets us remember where the user was trying to go
  // so we can redirect them back after login
  const location = useLocation()

  // Still checking if user is logged in — show spinner
  if (loading) {
    return <Spinner fullScreen />
  }

  // Not logged in — redirect to login
  // state saves the current location so login page can
  // redirect back here after successful login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Logged in but wrong role — redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  // All checks passed — render the child route
  // Outlet renders whatever child route matched
  return <Outlet />
}

export default ProtectedRoute