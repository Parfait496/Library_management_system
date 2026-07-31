import { BorrowStatus, FineStatus } from '../types'

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-US', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export const formatAmount = (amount: number): string =>
  `${Number(amount).toLocaleString()} RWF`

export const getBorrowStatusClass = (status: BorrowStatus): string => {
  const map: Record<BorrowStatus, string> = {
    REQUESTED: 'badge-warning',
    APPROVED:  'badge-info',
    BORROWED:  'badge-info',
    RETURNED:  'badge-success',
    REJECTED:  'badge-secondary',
    OVERDUE:   'badge-danger',
  }
  return map[status] || 'badge-secondary'
}

export const getFineStatusClass = (status: FineStatus): string => {
  const map: Record<FineStatus, string> = {
    UNPAID: 'badge-danger',
    PAID:   'badge-success',
    WAIVED: 'badge-secondary',
  }
  return map[status] || 'badge-secondary'
}

export const getDisplayName = (user?: {
  first_name?: string
  last_name?:  string
  full_name?:  string
  username:    string
}): string => {
  if (!user) return ''
  return user.full_name ||
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    user.username
}