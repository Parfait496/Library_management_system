import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// Log URL so we can debug in browser console
console.log('🔗 API URL:', API_BASE_URL)

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important for CORS
  withCredentials: false,
})

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!refreshToken) throw new Error('No refresh token')

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        )

        const newAccessToken = response.data.access
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)

      } catch (refreshError) {
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
export { API_BASE_URL }