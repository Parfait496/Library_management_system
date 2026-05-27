import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Camera, BookOpen } from 'lucide-react'
import {
  getBookApi, createBookApi,
  updateBookApi, getGenresApi,
} from '../../api/books'
import { Genre } from '../../types'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'

const BookForm: React.FC = () => {
  const { id }      = useParams<{ id: string }>()
  const isEditing   = !!id
  const navigate    = useNavigate()
  const fileRef     = useRef<HTMLInputElement>(null)

  const [genres, setGenres]         = useState<Genre[]>([])
  const [loading, setLoading]       = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [error, setError]           = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [coverFile, setCoverFile]   = useState<File | null>(null)
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
  })

  useEffect(() => {
    const load = async () => {
      try {
        const genresData = await getGenresApi()
        setGenres(genresData)

        if (isEditing) {
          const book = await getBookApi(Number(id))
          setFormData({
            isbn:             book.isbn || '',
            title:            book.title || '',
            author:           book.author || '',
            publisher:        book.publisher || '',
            publication_year: book.publication_year?.toString() || '',
            genre:            book.genre?.toString() || '',
            description:      book.description || '',
            total_copies:     book.total_copies.toString(),
          })
          // Show existing cover
          if ((book as any).cover_image_url) {
            setCoverPreview((book as any).cover_image_url)
          }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate size — max 2MB
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be smaller than 2MB.')
        return
      }
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)

    try {
      // Build data object — only include non-empty values
      const data: Record<string, any> = {
        isbn:         formData.isbn,
        title:        formData.title,
        author:       formData.author,
        total_copies: Number(formData.total_copies),
      }

      if (formData.publisher)        data.publisher = formData.publisher
      if (formData.publication_year) data.publication_year = Number(formData.publication_year)
      if (formData.genre)            data.genre = Number(formData.genre)
      if (formData.description)      data.description = formData.description
      if (coverFile)                 data.cover_image = coverFile

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
        setError('Please fix the errors below.')
      } else {
        setError('Failed to save book. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <Spinner fullScreen />

  return (
    <div>
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

            {/* Cover image upload */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-32 bg-gray-100 rounded-xl
                             border-2 border-dashed border-gray-300
                             flex flex-col items-center justify-center
                             cursor-pointer hover:border-blue-400
                             hover:bg-blue-50 transition-colors
                             overflow-hidden flex-shrink-0"
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <BookOpen className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">
                        Click to upload
                      </span>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    {coverPreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPEG, PNG or WebP. Max 2MB.
                  </p>
                  {coverFile && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {coverFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                label="Year"
                name="publication_year"
                type="number"
                placeholder="e.g. 2023"
                value={formData.publication_year}
                onChange={handleChange}
                error={fieldErrors.publication_year}
              />
            </div>

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
                <option value="">Select genre (optional)</option>
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
              <Button type="submit" loading={loading}>
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