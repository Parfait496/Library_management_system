import api from './axios'
import { Book, Genre, PaginatedResponse } from '../types'

export const getBooksApi = async (params?: {
  search?:    string
  genre?:     number    // exact subcategory id
  category?:  number    // top-level category id — matches its subcategories too
  page?:      number
  page_size?: number
  ordering?:  string
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
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateBookApi = async (
  id:   number,
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
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteBookApi = async (id: number): Promise<void> => {
  await api.delete(`/books/${id}/`)
}

// params.top_level = true → only top-level categories, each with
// .subcategories nested (e.g. "Medical Sciences" with "Anatomy" inside).
// Omit it (or false) → flat list of every category + subcategory.
export const getGenresApi = async (
  params?: { top_level?: boolean }
): Promise<Genre[]> => {
  const response = await api.get('/genres/', { params })
  const data = response.data
  if (Array.isArray(data)) return data
  if (data.results) return data.results
  return []
}

export interface CreateGenreInput {
  name:        string
  description?: string
  parent?:     number | null
}

export const createGenreApi = async (
  data: CreateGenreInput
): Promise<Genre> => {
  const response = await api.post<Genre>('/genres/', data)
  return response.data
}

export const updateGenreApi = async (
  id:   number,
  data: CreateGenreInput
): Promise<Genre> => {
  const response = await api.put<Genre>(`/genres/${id}/`, data)
  return response.data
}

export const deleteGenreApi = async (id: number): Promise<void> => {
  await api.delete(`/genres/${id}/`)
}