// books.ts — all book related API calls

import api from './axios'
import { Book, Genre, BookFormData, PaginatedResponse } from '../types'

// Get all books with optional search and filter
export const getBooksApi = async (params?: {
  search?: string
  genre?: number
  page?: number
}): Promise<PaginatedResponse<Book>> => {
  const response = await api.get<PaginatedResponse<Book>>('/books/', { params })
  return response.data
}

// Get single book by ID
export const getBookApi = async (id: number): Promise<Book> => {
  const response = await api.get<Book>(`/books/${id}/`)
  return response.data
}

// Create a new book — librarian/admin only
export const createBookApi = async (data: BookFormData): Promise<Book> => {
  // FormData is needed when uploading files (cover image)
  const formData = new FormData()

  // Append all fields to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob)
    }
  })

  const response = await api.post<Book>('/books/', formData, {
    headers: {
      // Override Content-Type for file upload
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Update a book
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

// Delete a book — admin only
export const deleteBookApi = async (id: number): Promise<void> => {
  await api.delete(`/books/${id}/`)
}

// Get all genres
export const getGenresApi = async (): Promise<Genre[]> => {
  const response = await api.get<Genre[]>('/genres/')
  return response.data
}

// Create a genre
export const createGenreApi = async (
  data: Omit<Genre, 'id'>
): Promise<Genre> => {
  const response = await api.post<Genre>('/genres/', data)
  return response.data
}