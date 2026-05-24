// PublicRoute.tsx — wraps routes that should NOT be
// accessible when logged in (login, register)
// If user IS logged in → redirect to dashboard

import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

const PublicRoute: React.FC = () => {
  const { user, loading } = useAuth()

  // Still checking auth state
  if (loading) {
    return <Spinner fullScreen />
  }

  // Already logged in — no need to see login/register
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Not logged in — show the public page
  return <Outlet />
}

export default PublicRoute