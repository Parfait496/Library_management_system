// auth.ts — all authentication related API calls

import api from './axios'
import { LoginCredentials, RegisterData, AuthTokens, User } from '../types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants'

// Login — sends credentials, gets back tokens
export const loginApi = async (
  credentials: LoginCredentials
): Promise<AuthTokens> => {
  const response = await api.post<AuthTokens>('/auth/login/', credentials)
  return response.data
}

// Register — creates new account
export const registerApi = async (
  data: RegisterData
): Promise<User> => {
  const response = await api.post<User>('/auth/register/', data)
  return response.data
}

// Logout — blacklists refresh token on server
export const logoutApi = async (): Promise<void> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (refreshToken) {
    // Tell server to blacklist this token
    await api.post('/auth/logout/', { refresh: refreshToken })
  }
}

// Get current user profile
export const getProfileApi = async (): Promise<User> => {
  const response = await api.get<User>('/users/profile/')
  return response.data
}

// Save tokens to localStorage
export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

// Clear tokens from localStorage
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY)
}