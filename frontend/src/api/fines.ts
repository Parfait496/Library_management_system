// fines.ts — all fines related API calls

import api from './axios'
import { Fine, PaginatedResponse } from '../types'

// Get fines
// Librarians see all, members see only their own
export const getFinesApi = async (params?: {
  status?: string
  page?: number
}): Promise<PaginatedResponse<Fine>> => {
  const response = await api.get<PaginatedResponse<Fine>>(
    '/fines/',
    { params }
  )
  return response.data
}

// Get single fine
export const getFineApi = async (id: number): Promise<Fine> => {
  const response = await api.get<Fine>(`/fines/${id}/`)
  return response.data
}

// Librarian resolves a fine (paid or waived)
export const resolveFineApi = async (
  id: number,
  action: 'paid' | 'waive',
  note?: string
): Promise<Fine> => {
  const response = await api.post<Fine>(`/fines/${id}/resolve/`, {
    action,
    note,
  })
  return response.data
}