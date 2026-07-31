// GenreManagement.tsx
// Allows librarians and admins to add, edit, delete genres
// and their subcategories (e.g. Medical Sciences > Anatomy)

import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Edit, Trash2, Tag, CornerDownRight } from 'lucide-react'
import { Genre } from '../../types'
import {
  getGenresApi, createGenreApi, updateGenreApi, deleteGenreApi,
  CreateGenreInput,
} from '../../api/books'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'

const GenreManagement: React.FC = () => {
  // Top-level categories, each with .subcategories nested
  const [categories, setCategories] = useState<Genre[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [formData, setFormData]     = useState<{
    name: string
    description: string
    parent: string
  }>({
    name: '',
    description: '',
    parent: '', // '' = top-level category
  })
  const [saving, setSaving] = useState(false)

  const loadGenres = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGenresApi({ top_level: true })
      setCategories(data)
    } catch (err) {
      setError('Failed to load genres.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGenres() }, [loadGenres])

  const totalGenreCount = categories.reduce(
    (sum, cat) => sum + 1 + cat.subcategories.length,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: CreateGenreInput = {
      name:        formData.name,
      description: formData.description || undefined,
      parent:      formData.parent ? Number(formData.parent) : null,
    }

    try {
      if (editingGenre) {
        await updateGenreApi(editingGenre.id, payload)
        setSuccess(`"${formData.name}" updated.`)
      } else {
        await createGenreApi(payload)
        setSuccess(`"${formData.name}" created.`)
      }
      setFormData({ name: '', description: '', parent: '' })
      setShowForm(false)
      setEditingGenre(null)
      await loadGenres()
    } catch (err: any) {
      setError(
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        'Failed to save.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = () => {
    setEditingGenre(null)
    setFormData({ name: '', description: '', parent: '' })
    setShowForm(true)
  }

  const handleAddSubcategory = (parent: Genre) => {
    setEditingGenre(null)
    setFormData({ name: '', description: '', parent: parent.id.toString() })
    setShowForm(true)
  }

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre)
    setFormData({
      name:        genre.name,
      description: genre.description || '',
      parent:      genre.parent?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (genre: Genre) => {
    const warning = genre.subcategories?.length
      ? `Delete "${genre.name}"? Its ${genre.subcategories.length} subcategor${genre.subcategories.length === 1 ? 'y' : 'ies'} will also be deleted, and any books in them will lose their genre.`
      : `Delete "${genre.name}"? Books in this genre will lose their genre.`

    if (!window.confirm(warning)) return

    try {
      await deleteGenreApi(genre.id)
      setSuccess(`"${genre.name}" deleted.`)
      await loadGenres()
    } catch (err) {
      setError('Failed to delete.')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingGenre(null)
    setFormData({ name: '', description: '', parent: '' })
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
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'},{' '}
            {totalGenreCount} total genre{totalGenreCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4" />
          Add Category
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
            {editingGenre
              ? `Edit ${editingGenre.parent ? 'Subcategory' : 'Category'}`
              : formData.parent
                ? 'Add New Subcategory'
                : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                value={formData.parent}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, parent: e.target.value }))
                }
                className="input-field"
              >
                <option value="">— None (top-level category) —</option>
                {categories
                  .filter(cat => cat.id !== editingGenre?.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave as "None" to create a top-level category
                (e.g. "Medical Sciences"). Choose a parent to create
                a subcategory under it (e.g. "Anatomy").
              </p>
            </div>

            <Input
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder={
                formData.parent ? 'e.g. Anatomy' : 'e.g. Medical Sciences'
              }
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
                placeholder="Brief description (optional)"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                {editingGenre ? 'Save Changes' : 'Add'}
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

      {/* Category / Subcategory tree */}
      <div className="card p-0 overflow-hidden">
        {categories.length > 0 ? (
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
              {categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Top-level category row */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50 bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAddSubcategory(cat)}
                        >
                          <Plus className="w-3 h-3" />
                          Add Subcategory
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(cat)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Subcategory rows, indented */}
                  {cat.subcategories.map((sub) => (
                    <tr key={sub.id}
                        className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 pl-10">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">
                            {sub.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {sub.description || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(sub)}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(sub)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No categories yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenreManagement