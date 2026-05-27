import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Edit, Trash2,
  BookMarked, Calendar, Hash, User
} from 'lucide-react'
import { getBookApi, deleteBookApi } from '../../api/books'
import { requestBorrowApi } from '../../api/borrowing'
import { Book } from '../../types'
import useAuth from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLibrarian, isAdmin, isMember } = useAuth()

  const [book, setBook]       = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [borrowing, setBorrowing] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await getBookApi(Number(id))
        setBook(data)
      } catch (err) {
        setError('Book not found.')
      } finally {
        setLoading(false)
      }
    }
    loadBook()
  }, [id])

  const handleBorrowRequest = async () => {
    if (!book) return
    setBorrowing(true)
    setError(null)
    try {
      await requestBorrowApi(book.id)
      setSuccess(
        'Borrow request submitted! Wait for librarian approval.'
      )
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to submit borrow request.'
      )
    } finally {
      setBorrowing(false)
    }
  }

  const handleDelete = async () => {
    if (!book) return
    if (!window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    )) return

    setDeleting(true)
    try {
      await deleteBookApi(book.id)
      navigate('/books')
    } catch (err) {
      setError('Failed to delete book.')
      setDeleting(false)
    }
  }

  if (loading) return <Spinner fullScreen />
  if (!book) return (
    <div className="text-center py-16 text-gray-500">
      Book not found.
    </div>
  )

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/books')}
        className="flex items-center gap-2 text-gray-500
                   hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalogue
      </button>

      {/* Alerts */}
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error}
                 onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success}
                 onClose={() => setSuccess(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left — cover image */}
        <div className="md:col-span-1">
          <div className="aspect-[3/4] bg-gradient-to-br from-blue-100
                          to-blue-200 rounded-xl flex items-center
                          justify-center overflow-hidden">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-24 h-24 text-blue-400" />
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2">
            {/* Member — request borrow */}
            {isMember && book.is_available && (
              <Button
                fullWidth
                onClick={handleBorrowRequest}
                loading={borrowing}
                variant="success"
              >
                <BookMarked className="w-4 h-4" />
                Request to Borrow
              </Button>
            )}

            {/* Member — unavailable */}
            {isMember && !book.is_available && (
              <div className="text-center py-2 text-gray-500 text-sm">
                No copies available right now
              </div>
            )}

            {/* Librarian/Admin — edit */}
            {(isLibrarian || isAdmin) && (
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate(`/books/${book.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
                Edit Book
              </Button>
            )}

            {/* Admin only — delete */}
            {isAdmin && (
              <Button
                fullWidth
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="w-4 h-4" />
                Delete Book
              </Button>
            )}
          </div>
        </div>

        {/* Right — book details */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {book.title}
            </h1>
          </div>

          <p className="text-xl text-gray-500 mb-4">by {book.author}</p>

          {/* Availability badge */}
          <div className="mb-6">
            {book.is_available ? (
              <Badge variant="success">
                {book.availability_status}
              </Badge>
            ) : (
              <Badge variant="danger">Not Available</Badge>
            )}
            {book.genre_name && (
              <Badge variant="info" className="ml-2">
                {book.genre_name}
              </Badge>
            )}
          </div>

          {/* Book metadata */}
          <div className="card mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Book Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                icon={<Hash className="w-4 h-4" />}
                label="ISBN"
                value={book.isbn}
              />
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Author"
                value={book.author}
              />
              <DetailRow
                icon={<BookOpen className="w-4 h-4" />}
                label="Publisher"
                value={book.publisher || '—'}
              />
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Year"
                value={book.publication_year?.toString() || '—'}
              />
              <DetailRow
                icon={<BookMarked className="w-4 h-4" />}
                label="Total Copies"
                value={book.total_copies.toString()}
              />
              <DetailRow
                icon={<BookMarked className="w-4 h-4" />}
                label="Available"
                value={book.available_copies.toString()}
              />
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Small helper component for detail rows
const DetailRow: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-gray-400 mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

export default BookDetail