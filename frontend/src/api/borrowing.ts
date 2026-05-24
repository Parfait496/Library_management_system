// borrowing.ts — all borrowing related API calls

import api from './axios'
import { BorrowRecord, PaginatedResponse } from '../types'

// Get borrow records
// Librarians see all, members see only their own
export const getBorrowRecordsApi = async (params?: {
  status?: string
  page?: number
}): Promise<PaginatedResponse<BorrowRecord>> => {
  const response = await api.get<PaginatedResponse<BorrowRecord>>(
    '/borrowing/',
    { params }
  )
  return response.data
}

// Get single borrow record
export const getBorrowRecordApi = async (
  id: number
): Promise<BorrowRecord> => {
  const response = await api.get<BorrowRecord>(`/borrowing/${id}/`)
  return response.data
}

// Member requests to borrow a book
export const requestBorrowApi = async (
  bookId: number
): Promise<BorrowRecord> => {
  const response = await api.post<BorrowRecord>(
    `/borrowing/request/${bookId}/`
  )
  return response.data
}

// Librarian approves a request
export const approveRequestApi = async (
  id: number,
  note?: string
): Promise<BorrowRecord> => {
  const response = await api.post<BorrowRecord>(
    `/borrowing/${id}/approve/`,
    { note }
  )
  return response.data
}

// Librarian rejects a request
export const rejectRequestApi = async (
  id: number,
  note?: string
): Promise<BorrowRecord> => {
  const response = await api.post<BorrowRecord>(
    `/borrowing/${id}/reject/`,
    { note }
  )
  return response.data
}

// Librarian marks book as borrowed (picked up)
export const markBorrowedApi = async (
  id: number
): Promise<BorrowRecord> => {
  const response = await api.post<BorrowRecord>(
    `/borrowing/${id}/mark-borrowed/`
  )
  return response.data
}

// Librarian marks book as returned
export const markReturnedApi = async (
  id: number
): Promise<BorrowRecord> => {
  const response = await api.post<BorrowRecord>(
    `/borrowing/${id}/mark-returned/`
  )
  return response.data
}