// users.ts — user and members API calls

import api from './axios'
import { User, PaginatedResponse } from '../types'

// Get all members — librarian/admin only
export const getMembersApi = async (params?: {
  search?: string
  page?: number
}): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>(
    '/users/members/',
    { params }
  )
  return response.data
}

// Get single member detail
export const getMemberApi = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/members/${id}/`)
  return response.data
}

// Update own profile
export const updateProfileApi = async (
  data: Partial<User>
): Promise<User> => {
  const response = await api.patch<User>('/users/profile/', data)
  return response.data
}

// Change password
export const changePasswordApi = async (data: {
  old_password: string
  new_password: string
  new_password2: string
}): Promise<void> => {
  await api.post('/users/change-password/', data)
}