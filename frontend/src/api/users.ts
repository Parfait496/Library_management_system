import api from './axios'
import { User, CreateUserData, PaginatedResponse } from '../types'

// Create user — admin creates librarians, librarian creates members
export const createUserApi = async (
  data: CreateUserData
): Promise<User> => {
  const response = await api.post<User>('/users/create/', data)
  return response.data
}

// Get all users (admin sees all, librarian sees members only)
export const getUsersApi = async (params?: {
  search?: string
  role?:   string
  page?:   number
}): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>(
    '/users/', { params }
  )
  return response.data
}

// Alias for dashboard — gets members specifically
export const getMembersApi = async (params?: {
  search?: string
  page?:   number
}): Promise<PaginatedResponse<User>> => {
  return getUsersApi({ ...params, role: 'MEMBER' })
}

// Get single user
export const getUserApi = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/${id}/`)
  return response.data
}

// Alias used in MemberDetail page
export const getMemberApi = async (id: number): Promise<User> => {
  return getUserApi(id)
}

// Update user
export const updateUserApi = async (
  id:   number,
  data: Partial<User>
): Promise<User> => {
  const response = await api.patch<User>(`/users/${id}/`, data)
  return response.data
}

// Delete user (admin only)
export const deleteUserApi = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}/`)
}

// Update own profile
export const updateProfileApi = async (
  data: FormData | Partial<User>
): Promise<User> => {
  const isFormData = data instanceof FormData
  const response = await api.patch<User>('/users/profile/', data, {
    headers: isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' },
  })
  return response.data
}

// Change own password
export const changePasswordApi = async (data: {
  old_password:  string
  new_password:  string
  new_password2: string
}): Promise<void> => {
  await api.post('/users/change-password/', data)
}