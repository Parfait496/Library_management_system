import React from 'react'
import { BorrowStatus, FineStatus } from '../../types'
import { getBorrowStatusClass, getFineStatusClass } from '../../utils/helpers'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'secondary'
  className?: string
}

// Generic badge
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = '',
}) => {
  const variantClasses = {
    success:   'badge-success',
    danger:    'badge-danger',
    warning:   'badge-warning',
    info:      'badge-info',
    secondary: 'badge-secondary',
  }

  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Borrow status badge — automatically picks color
export const BorrowStatusBadge: React.FC<{ status: BorrowStatus }> = ({
  status,
}) => {
  const labels: Record<BorrowStatus, string> = {
    REQUESTED: 'Requested',
    APPROVED:  'Approved',
    BORROWED:  'Borrowed',
    RETURNED:  'Returned',
    REJECTED:  'Rejected',
    OVERDUE:   'Overdue',
  }

  return (
    <span className={getBorrowStatusClass(status)}>
      {labels[status]}
    </span>
  )
}

// Fine status badge — automatically picks color
export const FineStatusBadge: React.FC<{ status: FineStatus }> = ({
  status,
}) => {
  const labels: Record<FineStatus, string> = {
    UNPAID: 'Unpaid',
    PAID:   'Paid',
    WAIVED: 'Waived',
  }

  return (
    <span className={getFineStatusClass(status)}>
      {labels[status]}
    </span>
  )
}

export default Badge