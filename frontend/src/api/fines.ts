import api from './axios'
import { Fine, PaginatedResponse } from '../types'

export const getFinesApi = async (params?: {
  status?:    string
  page?:      number
  page_size?: number
}): Promise<PaginatedResponse<Fine>> => {
  const response = await api.get<PaginatedResponse<Fine>>(
    '/fines/', { params: { page_size: 500, ...params } }
  )
  return response.data
}

export const getFineApi = async (id: number): Promise<Fine> => {
  const response = await api.get<Fine>(`/fines/${id}/`)
  return response.data
}

export const resolveFineApi = async (
  id:     number,
  action: 'paid' | 'waive',
  note?:  string
): Promise<Fine> => {
  const response = await api.post<Fine>(
    `/fines/${id}/resolve/`, { action, note }
  )
  return response.data
}