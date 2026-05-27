// GenreManagement.tsx
// Allows librarians and admins to add, edit, delete genres

import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { getGenresApi, createGenreApi } from '../../api/books'
import { Genre } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import api from '../../api/axios'

const GenreManagement: React.FC = () => {
  const [genres, setGenres]         = useState<Genre[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [formData, setFormData]     = useState({ name: '', description: '' })
  const [saving, setSaving]         = useState(false)

  const loadGenres = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGenresApi()
      setGenres(data)
    } catch (err) {
      setError('Failed to load genres.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGenres() }, [loadGenres])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (editingGenre) {
        // Update existing genre
        await api.put(`/genres/${editingGenre.id}/`, formData)
        setSuccess(`Genre "${formData.name}" updated.`)
      } else {
        // Create new genre
        await createGenreApi(formData)
        setSuccess(`Genre "${formData.name}" created.`)
      }
      setFormData({ name: '', description: '' })
      setShowForm(false)
      setEditingGenre(null)
      await loadGenres()
    } catch (err: any) {
      setError(err.response?.data?.name?.[0] || 'Failed to save genre.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre)
    setFormData({
      name:        genre.name,
      description: genre.description || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (genre: Genre) => {
    if (!window.confirm(
      `Delete "${genre.name}"? Books in this genre will lose their genre.`
    )) return

    try {
      await api.delete(`/genres/${genre.id}/`)
      setSuccess(`Genre "${genre.name}" deleted.`)
      await loadGenres()
    } catch (err) {
      setError('Failed to delete genre.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingGenre(null)
    setFormData({ name: '', description: '' })
  }

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Genre Management
          </h1>
          <p className="text-gray-500 mt-1">
            {genres.length} genre{genres.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Genre
        </Button>
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

      {/* Add/Edit form */}
      {showForm && (
        <div className="card mb-6 border-blue-200 border-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGenre ? 'Edit Genre' : 'Add New Genre'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Genre Name"
              value={formData.name}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Science Fiction"
              required
              autoFocus
            />
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Brief description of this genre"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                {editingGenre ? 'Save Changes' : 'Add Genre'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Genres list */}
      <div className="card p-0 overflow-hidden">
        {genres.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Genre</th>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-500
                               font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id}
                    className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {genre.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {genre.description || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(genre)}
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(genre)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No genres yet. Add your first genre!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenreManagement