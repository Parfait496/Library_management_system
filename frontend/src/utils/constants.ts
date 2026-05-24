// Base API URL — reads from environment variable
// In development: http://localhost:8000/api
// In production: your backend URL
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

// Local storage keys — keep these in one place
// so you never mistype them
export const ACCESS_TOKEN_KEY = 'library_access_token'
export const REFRESH_TOKEN_KEY = 'library_refresh_token'

// Borrow period in days
export const DEFAULT_BORROW_DAYS = 14

// Fine rate per day in RWF
export const FINE_RATE_PER_DAY = 100

// User roles
export const ROLES = {
  ADMIN: 'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  MEMBER: 'MEMBER',
} as const