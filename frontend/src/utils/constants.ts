export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

export const ACCESS_TOKEN_KEY  = 'asome_access_token'
export const REFRESH_TOKEN_KEY = 'asome_refresh_token'

export const FINE_RATE_PER_DAY  = 100
export const DEFAULT_BORROW_DAYS = 14

export const ROLES = {
  ADMIN:     'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  MEMBER:    'MEMBER',
} as const