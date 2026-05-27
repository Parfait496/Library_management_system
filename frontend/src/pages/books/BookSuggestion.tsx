import React, { useEffect, useState } from 'react'
import { Lightbulb, Plus } from 'lucide-react'
import api from '../../api/axios'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/helpers'
import useAuth from '../../hooks/useAuth'

interface Suggestion {
  id: number
  title: string
  author: string
  isbn?: string
  reason?: string
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
  admin_note?: string
  created_at: string
  suggested_by_username?: string
}

const BookSuggestion: React.FC = () => {
  const { isLibrarian, isAdmin, isMember } = useAuth()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState<string | null>(null)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [formData, setFormData]       = useState({
    title: '', author: '', isbn: '', reason: ''
  })

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/books/suggestions/')
      const data = res.data
      setSuggestions(data.results || data)
    } catch (err) {
      setError('Failed to load suggestions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSuggestions() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post('/books/suggestions/', formData)
      setSuccess('Your suggestion has been submitted!')
      setFormData({ title: '', author: '', isbn: '', reason: '' })
      setShowForm(false)
      await loadSuggestions()
    } catch (err: any) {
      setError('Failed to submit suggestion.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (
    id: number,
    status: string,
    note: string = ''
  ) => {
    try {
      await api.patch(`/books/suggestions/${id}/`, {
        status, admin_note: note
      })
      setSuccess('Status updated.')
      await loadSuggestions()
    } catch (err) {
      setError('Failed to update status.')
    }
  }

  const statusVariant = (status: string) => {
    if (status === 'APPROVED') return 'success'
    if (status === 'REJECTED') return 'danger'
    if (status === 'REVIEWED') return 'info'
    return 'warning'
  }

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Book Suggestions
          </h1>
          <p className="text-gray-500 mt-1">
            {isMember
              ? 'Suggest books you would like the library to acquire'
              : 'Member book suggestions'
            }
          </p>
        </div>
        {isMember && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Suggest a Book
          </Button>
        )}
      </div>

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

      {/* Suggestion form */}
      {showForm && (
        <div className="card mb-6 border-blue-200 border-2">
          <h2 className="text-lg font-semibold mb-4">
            Suggest a Book
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Book Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData(p => ({ ...p, title: e.target.value }))
                }
                placeholder="The Great Gatsby"
                required
              />
              <Input
                label="Author"
                value={formData.author}
                onChange={(e) =>
                  setFormData(p => ({ ...p, author: e.target.value }))
                }
                placeholder="F. Scott Fitzgerald"
                required
              />
            </div>
            <Input
              label="ISBN (optional)"
              value={formData.isbn}
              onChange={(e) =>
                setFormData(p => ({ ...p, isbn: e.target.value }))
              }
              placeholder="9780743273565"
            />
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Why should we get this book?
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData(p => ({ ...p, reason: e.target.value }))
                }
                rows={3}
                className="input-field resize-none"
                placeholder="This book is great for..."
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                Submit Suggestion
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Suggestions list */}
      <div className="card p-0 overflow-hidden">
        {suggestions.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {(isLibrarian || isAdmin) && (
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Member</th>
                )}
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Book</th>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Date</th>
                {(isLibrarian || isAdmin) && (
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id}
                    className="border-b border-gray-100 hover:bg-gray-50">
                  {(isLibrarian || isAdmin) && (
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {s.suggested_by_username}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-500">{s.author}</p>
                    {s.isbn && (
                      <p className="text-xs text-gray-400">
                        ISBN: {s.isbn}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">
                      {s.reason || '—'}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusVariant(s.status) as any}>
                      {s.status}
                    </Badge>
                    {s.admin_note && (
                      <p className="text-xs text-gray-500 mt-1">
                        {s.admin_note}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatDate(s.created_at)}
                  </td>
                  {(isLibrarian || isAdmin) && (
                    <td className="py-3 px-4">
                      {s.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              handleStatusUpdate(s.id, 'APPROVED')
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              handleStatusUpdate(
                                s.id, 'REJECTED',
                                'Not currently needed.'
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No suggestions yet</p>
            {isMember && (
              <p className="text-sm mt-1">
                Be the first to suggest a book!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookSuggestion