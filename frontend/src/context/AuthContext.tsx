import React, {
  createContext, useState,
  useEffect, useCallback, ReactNode
} from 'react'
import { User } from '../types'
import {
  loginApi, logoutApi,
  getProfileApi, saveTokens, clearTokens, isAuthenticated
} from '../api/auth'

interface AuthContextType {
  user:        User | null
  loading:     boolean
  error:       string | null
  login:       (username: string, password: string) => Promise<void>
  logout:      () => Promise<void>
  isAdmin:     boolean
  isLibrarian: boolean
  isMember:    boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // Load user on app start
  useEffect(() => {
    const load = async () => {
      if (isAuthenticated()) {
        try {
          const u = await getProfileApi()
          setUser(u)
        } catch {
          clearTokens()
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const login = useCallback(async (
    username: string,
    password: string
  ) => {
    setError(null)
    setLoading(true)
    try {
      const tokens = await loginApi({ username, password })
      saveTokens(tokens)
      const u = await getProfileApi()
      setUser(u)
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        'Invalid username or password.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      isAdmin:     user?.role === 'ADMIN',
      isLibrarian: user?.role === 'LIBRARIAN',
      isMember:    user?.role === 'MEMBER',
    }}>
      {children}
    </AuthContext.Provider>
  )
}