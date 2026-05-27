// ==========================================================================
// AUTH TYPES
// ==========================================================================

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password2: string
  phone_number?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// ==========================================================================
// USER TYPES
// ==========================================================================

// Role can only be one of these three values
export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'MEMBER'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone_number?: string
  address?: string
  is_verified: boolean
  created_at: string
}

// ==========================================================================
// BOOK TYPES
// ==========================================================================

export interface Genre {
  id: number
  name: string
  description?: string
}

export interface Book {
  id: number
  isbn: string
  title: string
  author: string
  publisher?: string
  publication_year?: number
  genre?: number
  genre_name?: string
  description?: string
  total_copies: number
  available_copies: number
  cover_image?: string
  cover_image_url?: string
  is_available: boolean
  availability_status: string
  created_at: string
}

export interface BookFormData {
  isbn: string
  title: string
  author: string
  publisher?: string
  publication_year?: number
  genre?: number
  description?: string
  total_copies: number
  cover_image?: File
}

// ==========================================================================
// BORROWING TYPES
// ==========================================================================

// Status can only be one of these values — matches Django model
export type BorrowStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'BORROWED'
  | 'RETURNED'
  | 'OVERDUE'

export interface BorrowRecord {
  id: number
  member: number
  member_detail?: User
  book: number
  book_detail?: Book
  status: BorrowStatus
  request_date: string
  approved_date?: string
  borrow_date?: string
  due_date?: string
  return_date?: string
  processed_by?: number
  librarian_note?: string
  is_overdue: boolean
  days_overdue: number
  fine_amount: number
}

// ==========================================================================
// FINE TYPES
// ==========================================================================

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED'

export interface Fine {
  id: number
  borrow_record: number
  member: number
  member_username: string
  book_title: string
  amount: number
  days_overdue: number
  status: FineStatus
  issued_date: string
  resolved_date?: string
  resolved_by?: number
  note?: string
  is_paid: boolean
  is_resolved: boolean
}

// ==========================================================================
// API RESPONSE TYPES
// ==========================================================================

// Django REST framework returns paginated results in this format
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Generic API error format
export interface ApiError {
  detail?: string
  [key: string]: string | string[] | undefined
}