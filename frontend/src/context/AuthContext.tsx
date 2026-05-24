// AuthContext.tsx — global authentication state
// This wraps the entire app so any component can
// access the logged-in user and auth functions
// without prop drilling

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { User } from '../types'
import { loginApi, logoutApi, getProfileApi, saveTokens, clearTokens, isAuthenticated } from '../api/auth'
import { LoginCredentials } from '../types'

// Define what the context provides to components
interface AuthContextType {
  // The currently logged-in user (null if not logged in)
  user: User | null

  // Loading state — true while checking if user is logged in
  loading: boolean

  // Error message from login attempts
  error: string | null

  // Auth functions components can call
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>

  // Helper role checks — cleaner than checking user.role everywhere
  isAdmin: boolean
  isLibrarian: boolean
  isMember: boolean
}

// Create the context with undefined default
// (will be provided by AuthProvider)
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Current logged-in user
  const [user, setUser] = useState<User | null>(null)

  // True while fetching user profile on app load
  const [loading, setLoading] = useState<boolean>(true)

  // Error from login attempts
  const [error, setError] = useState<string | null>(null)

  // ===========================================================================
  // LOAD USER ON APP START
  // When the app loads, check if there's a token in localStorage
  // If yes, fetch the user profile to restore the session
  // ===========================================================================
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          // Token exists — get user profile from API
          const userData = await getProfileApi()
          setUser(userData)
        } catch (err) {
          // Token is invalid or expired — clear it
          clearTokens()
          setUser(null)
        }
      }
      // Done loading regardless of result
      setLoading(false)
    }

    loadUser()
  }, [])

  // ===========================================================================
  // LOGIN
  // ===========================================================================
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null)
      setLoading(true)

      // Get tokens from API
      const tokens = await loginApi(credentials)

      // Save tokens to localStorage
      saveTokens(tokens)

      // Get user profile with the new token
      const userData = await getProfileApi()
      setUser(userData)

    } catch (err: any) {
      // Extract error message from API response
      const message =
        err.response?.data?.detail ||
        'Invalid username or password.'
      setError(message)
      throw err  // re-throw so the Login page can handle it
    } finally {
      setLoading(false)
    }
  }, [])

  // ===========================================================================
  // LOGOUT
  // ===========================================================================
  const logout = useCallback(async () => {
    try {
      // Tell server to blacklist the refresh token
      await logoutApi()
    } catch (err) {
      // Even if server logout fails, clear local state
      console.error('Logout error:', err)
    } finally {
      clearTokens()
      setUser(null)
    }
  }, [])

  // ===========================================================================
  // ROLE HELPERS
  // Computed from user.role — easier to use in components
  // ===========================================================================
  const isAdmin = user?.role === 'ADMIN'
  const isLibrarian = user?.role === 'LIBRARIAN'
  const isMember = user?.role === 'MEMBER'

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isLibrarian,
    isMember,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}