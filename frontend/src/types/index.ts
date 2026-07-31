// All TypeScript interfaces for ASOME Library Management System

// ===========================================================================
// AUTH
// ===========================================================================
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access:  string
  refresh: string
}

// ===========================================================================
// USER
// ===========================================================================
export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'MEMBER'

export interface User {
  id:                  number
  username:            string
  email:               string
  first_name:          string
  last_name:           string
  full_name:           string
  role:                UserRole
  phone_number?:       string
  address?:            string
  student_id?:         string
  profile_picture?:    string
  profile_picture_url?: string
  created_at:          string
}

export interface CreateUserData {
  username:      string
  email:         string
  first_name:    string
  last_name:     string
  password:      string
  role:          UserRole
  phone_number?: string
  student_id?:   string
}

// ===========================================================================
// BOOK
// ===========================================================================
export interface Genre {
  id:           number
  name:         string
  description?: string
  parent:         number | null      // ← NEW
  parent_name:    string | null      // ← NEW
  full_path:      string             // ← NEW
  subcategories:  Genre[] 
}

export interface Book {
  id:                  number
  isbn?:               string
  title:               string
  author:              string
  publisher?:          string
  publication_year?:   number
  genre_full_path?:    string  
  genre?:              number
  genre_name?:         string
  description?:        string
  total_copies:        number
  available_copies:    number
  cover_image?:        string
  cover_image_url?:    string
  is_available:        boolean
  availability_status: string
  created_at:          string
}

// ===========================================================================
// BORROWING
// ===========================================================================
export type BorrowStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'BORROWED'
  | 'RETURNED'
  | 'OVERDUE'

export interface BorrowRecord {
  id:              number
  member:          number
  member_detail?:  User
  book:            number
  book_detail?:    Book
  status:          BorrowStatus
  request_date:    string
  approved_date?:  string
  borrow_date?:    string
  due_date?:       string
  return_date?:    string
  processed_by?:   number
  librarian_note?: string
  is_overdue:      boolean
  days_overdue:    number
  fine_amount:     number
}

// ===========================================================================
// FINES
// ===========================================================================
export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED'

export interface Fine {
  id:              number
  borrow_record:   number
  member:          number
  member_username: string
  book_title:      string
  amount:          number
  days_overdue:    number
  status:          FineStatus
  issued_date:     string
  resolved_date?:  string
  resolved_by?:    number
  note?:           string
  is_paid:         boolean
  is_resolved:     boolean
}

// ===========================================================================
// API
// ===========================================================================
export interface PaginatedResponse<T> {
  count:    number
  next:     string | null
  previous: string | null
  results:  T[]
}