import { BorrowStatus, FineStatus } from '../types'

// Format date string to readable format
// e.g. "2025-01-15T10:30:00Z" → "Jan 15, 2025"
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date with time
// e.g. "Jan 15, 2025, 10:30 AM"
export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get Tailwind CSS class for borrow status badge
export const getBorrowStatusClass = (status: BorrowStatus): string => {
  const classes: Record<BorrowStatus, string> = {
    REQUESTED: 'badge-warning',
    APPROVED:  'badge-info',
    BORROWED:  'badge-info',
    RETURNED:  'badge-success',
    REJECTED:  'badge-secondary',
    OVERDUE:   'badge-danger',
  }
  return classes[status] || 'badge-secondary'
}

// Get Tailwind CSS class for fine status badge
export const getFineStatusClass = (status: FineStatus): string => {
  const classes: Record<FineStatus, string> = {
    UNPAID: 'badge-danger',
    PAID:   'badge-success',
    WAIVED: 'badge-secondary',
  }
  return classes[status] || 'badge-secondary'
}

// Format amount in RWF
export const formatAmount = (amount: number): string => {
  return `${amount.toLocaleString()} RWF`
}

// Get user's full name or username as fallback
export const getDisplayName = (
  user: { first_name?: string; last_name?: string; username: string }
): string => {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return fullName || user.username
}