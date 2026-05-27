import api from './axios'
import { Book, Genre, BookFormData, PaginatedResponse } from '../types'

export const getBooksApi = async (params?: {
  search?: string
  genre?: number
  page?: number
  ordering?: string
  page_size?: number
}): Promise<PaginatedResponse<Book>> => {
  const response = await api.get<PaginatedResponse<Book>>(
    '/books/', { params }
  )
  return response.data
}

export const getBookApi = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}/`)
  return response.data
}

export const createBookApi = async (data: any): Promise<Book> => {
  // Use FormData to support file uploads
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    }
  })

  const response = await api.post<Book>('/books/', formData, {
    headers: {
      // Let browser set Content-Type with boundary automatically
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updateBookApi = async (
  id: number,
  data: any
): Promise<Book> => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    }
  })

  const response = await api.patch<Book>(`/books/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteBookApi = async (id: number): Promise<void> => {
  await api.delete(`/books/${id}/`)
}

export const getGenresApi = async (): Promise<Genre[]> => {
  const response = await api.get('/genres/')
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