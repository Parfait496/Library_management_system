import api from './axios'
import { Book, Genre, BookFormData, PaginatedResponse } from '../types'

export const getBooksApi = async (params?: {
  search?: string
  genre?: number
  page?: number
}): Promise<PaginatedResponse<Book>> => {
  const response = await api.get<PaginatedResponse<Book>>('/books/', { params })
  return response.data
}

export const getBookApi = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}/`)
  return response.data
}

export const createBookApi = async (data: BookFormData): Promise<Book> => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob)
    }
  })
  const response = await api.post<Book>('/books/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateBookApi = async (
  id: number,
  data: Partial<BookFormData>
): Promise<Book> => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob)
    }
  })
  const response = await api.patch<Book>(`/books/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteBookApi = async (id: number): Promise<void> => {
  await api.delete(`/books/${id}/`)
}

// Genres — returns array directly (not paginated)
export const getGenresApi = async (): Promise<Genre[]> => {
  const response = await api.get('/genres/')
  // Handle both paginated and non-paginated responses
  const data = response.data
  if (Array.isArray(data)) return data
  if (data.results) return data.results
  return []
}

export const createGenreApi = async (
  data: Omit<Genre, 'id'>
): Promise<Genre> => {
  const response = await api.post<Genre>('/genres/', data)
  return response.data
}

export const getRecentBooksApi = async (
  limit: number = 6
): Promise<Book[]> => {
  const response = await api.get<PaginatedResponse<Book>>('/books/', {
    params: { ordering: '-created_at', page_size: limit }
  })
  const data = response.data
  return data.results || []
}