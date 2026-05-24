// axios.ts — the core HTTP client for all API calls
// This file sets up axios with:
// 1. Base URL so we don't repeat it everywhere
// 2. JWT token automatically attached to every request
// 3. Auto refresh token when access token expires
// 4. Auto logout when refresh token expires

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE_URL } from '../utils/constants'

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===========================================================================
// REQUEST INTERCEPTOR
// Runs before every request is sent
// Automatically attaches JWT access token to Authorization header
// ===========================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (token) {
      // Attach token to every request
      // Django expects: Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ===========================================================================
// RESPONSE INTERCEPTOR
// Runs after every response is received
// Handles token refresh when access token expires (401 error)
// ===========================================================================
api.interceptors.response.use(
  // If response is successful just return it
  (response: AxiosResponse) => response,

  async (error) => {
    // Get the original request that failed
    const originalRequest = error.config

    // If we got 401 (Unauthorized) and haven't retried yet
    // _retry flag prevents infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to get a new access token using the refresh token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

        if (!refreshToken) {
          // No refresh token — user must log in again
          throw new Error('No refresh token')
        }

        // Call Django's token refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        )

        const newAccessToken = response.data.access

        // Save the new access token
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

        // Update the failed request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh failed — clear tokens and redirect to login
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api