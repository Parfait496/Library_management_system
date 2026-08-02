import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, API_BASE_URL } from '../utils/constants'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Requests where a 401 means "wrong credentials" / "not logged in yet",
// NOT "your session expired" — these should never trigger a token
// refresh attempt or a forced redirect. Adjust these paths if your
// actual login/refresh endpoints differ.
const AUTH_ENDPOINTS = ['/auth/login', '/login', '/token', '/auth/refresh']

const isAuthEndpoint = (url?: string) =>
  !!url && AUTH_ENDPOINTS.some((path) => url.includes(path))

// Auto-refresh token on 401 — but only for real "session expired"
// cases, never for the login attempt itself.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Let 401s from the login/refresh endpoints just reject normally —
    // this is what lets Login.tsx's own catch block show
    // "Invalid username or password" instead of silently reloading.
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!refresh) throw new Error('No refresh token')

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh }
        )
        const newToken = res.data.access
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        // Don't force-reload if we're already on the login page —
        // avoids wiping any in-progress state there.
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api