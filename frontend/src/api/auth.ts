import axios from 'axios'
import api from './axios'
import { LoginCredentials, AuthTokens, User } from '../types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE_URL } from '../utils/constants'

export const loginApi = async (
  credentials: LoginCredentials
): Promise<AuthTokens> => {
  const response = await api.post<AuthTokens>('/auth/login/', credentials)
  return response.data
}

export const logoutApi = async (): Promise<void> => {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (refresh) {
    try {
      await api.post('/auth/logout/', { refresh })
    } catch {
      // Silent fail — tokens cleared regardless
    }
  }
}

export const getProfileApi = async (): Promise<User> => {
  const response = await api.get<User>('/users/profile/')
  return response.data
}

export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY)
}