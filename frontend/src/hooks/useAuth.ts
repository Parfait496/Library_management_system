// useAuth.ts — custom hook to access AuthContext
// Use this in any component instead of importing
// AuthContext and useContext directly
// Usage: const { user, login, logout } = useAuth()

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const useAuth = () => {
  const context = useContext(AuthContext)

  // If used outside AuthProvider throw a helpful error
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export default useAuth