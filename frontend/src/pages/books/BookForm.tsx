import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import {
  getBookApi,
  createBookApi,
  updateBookApi,
  getGenresApi,
} from '../../api/books'
import { Genre, BookFormData } from '../../types'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import useAuth from '../../hooks/useAuth'

const BookForm: React.FC = () => {
  // If id exists in URL we are editing, otherwise adding
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  useAuth()

  const [genres, setGenres]   = useState<Genre[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [error, setError]     = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    isbn:             '',
    title:            '',
    author:           '',
    publisher:        '',
    publication_year: '',
    genre:            '',
    description:      '',
    total_copies:     '1',
    cover_image:      '',
  })

  // Load genres and book data if editing
  useEffect(() => {
    const load = async () => {
      try {
        const genresData = await getGenresApi()
        setGenres(genresData)

        if (isEditing) {
          const book = await getBookApi(Number(id))
          setFormData({
            isbn:             book.isbn,
            title:            book.title,
            author:           book.author,
            publisher:        book.publisher || '',
            publication_year: book.publication_year?.toString() || '',
            genre:            book.genre?.toString() || '',
            description:      book.description || '',
            total_copies:     book.total_copies.toString(),
            cover_image:      book.cover_image || '',
          })
        }
      } catch (err) {
        setError('Failed to load data.')
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [id, isEditing])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)

    // Build the data object
    const data: BookFormData = {
      isbn:             formData.isbn,
      title:            formData.title,
      author:           formData.author,
      publisher:        formData.publisher || undefined,
      publication_year: formData.publication_year
        ? Number(formData.publication_year)
        : undefined,
      genre:            formData.genre ? Number(formData.genre) : undefined,
      description:      formData.description || undefined,
      total_copies:     Number(formData.total_copies),
      cover_image:      coverImage || undefined,
    }

    try {
      if (isEditing) {
        await updateBookApi(Number(id), data)
        navigate(`/books/${id}`)
      } else {
        const newBook = await createBookApi(data)
        navigate(`/books/${newBook.id}`)
      }
    } catch (err: any) {
      const responseData = err.response?.data
      if (responseData && typeof responseData === 'object') {
        const errors: Record<string, string> = {}
        Object.entries(responseData).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value)
        })
        setFieldErrors(errors)
      } else {
        setError('Failed to save book. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <Spinner fullScreen />

  // Add image handler
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }
}

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/books')}
        className="flex items-center gap-2 text-gray-500
                   hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Books
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Book' : 'Add New Book'}
        </h1>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error}
                   onClose={() => setError(null)} />
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="ISBN"
              name="isbn"
              placeholder="e.g. 9780743273565"
              value={formData.isbn}
              onChange={handleChange}
              error={fieldErrors.isbn}
              required
            />

            <Input
              label="Title"
              name="title"
              placeholder="Book title"
              value={formData.title}
              onChange={handleChange}
              error={fieldErrors.title}
              required
            />

            <Input
              label="Author"
              name="author"
              placeholder="Author full name"
              value={formData.author}
              onChange={handleChange}
              error={fieldErrors.author}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Publisher"
                name="publisher"
                placeholder="Publisher name"
                value={formData.publisher}
                onChange={handleChange}
                error={fieldErrors.publisher}
              />
              <Input
                label="Publication Year"
                name="publication_year"
                type="number"
                placeholder="e.g. 2023"
                value={formData.publication_year}
                onChange={handleChange}
                error={fieldErrors.publication_year}
              />
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Cover Image
  </label>
  {/* Preview */}
  {(coverPreview || formData.cover_image) && (
    <div className="mb-3">
      <img
        src={coverPreview || formData.cover_image}
        alt="Cover preview"
        className="w-32 h-44 object-cover rounded-lg
                   border border-gray-200"
      />
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="input-field"
  />
  <p className="text-xs text-gray-500 mt-1">
    Recommended: 300x400px, max 2MB
  </p>
</div>

            {/* Genre select */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
              {fieldErrors.genre && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.genre}
                </p>
              )}
            </div>

            <Input
              label="Total Copies"
              name="total_copies"
              type="number"
              placeholder="Number of copies"
              value={formData.total_copies}
              onChange={handleChange}
              error={fieldErrors.total_copies}
              required
            />

            {/* Description textarea */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Brief description of the book"
                value={formData.description}
                onChange={handleChange}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                loading={loading}
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Add Book'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/books')}
              >
                Cancel
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default BookForm