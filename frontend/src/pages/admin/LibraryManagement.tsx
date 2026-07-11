import React, { useEffect, useState, useCallback } from 'react'
import { Building2, Plus, Copy, Check, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'

interface Library {
  id:           number
  slug:         string
  name:         string
  description:  string
  email:        string
  phone:        string
  address:      string
  join_code:    string
  is_active:    boolean
  member_count: number
  book_count:   number
  created_at:   string
}

const LibraryManagement: React.FC = () => {
  const [libraries, setLibraries]   = useState<Library[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [copiedId, setCopiedId]     = useState<number | null>(null)
  const [visibleCodes, setVisibleCodes] = useState<Set<number>>(new Set())

  const [formData, setFormData] = useState({
    name:        '',
    slug:        '',
    description: '',
    email:       '',
    phone:       '',
    address:     '',
  })

  const loadLibraries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/libraries/admin/')
      setLibraries(res.data.results || res.data)
    } catch (err) {
      setError('Failed to load libraries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLibraries() }, [loadLibraries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/libraries/admin/', formData)
      setSuccess(`Library "${formData.name}" created successfully!`)
      setFormData({
        name: '', slug: '', description: '',
        email: '', phone: '', address: '',
      })
      setShowForm(false)
      await loadLibraries()
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msg = Object.values(data).flat().join(', ')
        setError(msg)
      } else {
        setError('Failed to create library.')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (library: Library) => {
    try {
      await api.patch(`/libraries/admin/${library.id}/`, {
        is_active: !library.is_active
      })
      setSuccess(
        `${library.name} ${library.is_active ? 'deactivated' : 'activated'}.`
      )
      await loadLibraries()
    } catch {
      setError('Failed to update library.')
    }
  }

  const copyJoinCode = async (library: Library) => {
    await navigator.clipboard.writeText(library.join_code)
    setCopiedId(library.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleCodeVisibility = (id: number) => {
    setVisibleCodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData(prev => ({ ...prev, name, slug }))
  }

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Library Management
          </h1>
          <p className="text-gray-500 mt-1">
            {libraries.length} librar{libraries.length !== 1 ? 'ies' : 'y'} registered
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Library
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

      {/* Create Library Form */}
      {showForm && (
        <div className="card mb-6 border-blue-200 border-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Library
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Library Name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="University of Kigali Library"
                required
                autoFocus
              />
              <Input
                label="URL Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData(p => ({ ...p, slug: e.target.value }))
                }
                placeholder="university-of-kigali"
                hint="Auto-generated from name. URL-friendly identifier."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData(p => ({ ...p, description: e.target.value }))
                }
                rows={2}
                className="input-field resize-none"
                placeholder="Brief description of this library"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData(p => ({ ...p, email: e.target.value }))
                }
                placeholder="library@university.ac.rw"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData(p => ({ ...p, phone: e.target.value }))
                }
                placeholder="+250 7XX XXX XXX"
              />
            </div>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData(p => ({ ...p, address: e.target.value }))
              }
              placeholder="Kigali, Rwanda"
            />

            <div className="bg-blue-50 border border-blue-200
                            rounded-lg p-3 text-sm text-blue-800">
              <strong>Note:</strong> A unique join code will be
              auto-generated for this library. Share it with members
              so they can join the correct library when registering.
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={saving}>
                Create Library
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

      {/* Libraries List */}
      {libraries.length > 0 ? (
        <div className="space-y-4">
          {libraries.map((library) => (
            <div
              key={library.id}
              className={`card border-2 transition-colors
                ${library.is_active
                  ? 'border-gray-200'
                  : 'border-gray-100 opacity-60'
                }`}
            >
              <div className="flex items-start justify-between gap-4">

                {/* Library info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl
                                  flex items-center justify-center
                                  flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {library.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5
                                       rounded-full font-medium
                        ${library.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                        {library.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      /{library.slug}
                    </p>
                    {library.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {library.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm
                                    text-gray-500">
                      <span>👥 {library.member_count} members</span>
                      <span>📚 {library.book_count} books</span>
                      {library.email && (
                        <span>✉️ {library.email}</span>
                      )}
                      <span>📅 {formatDate(library.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Join Code + Actions */}
                <div className="flex flex-col items-end gap-3
                                flex-shrink-0">

                  {/* Join code display */}
                  <div className="bg-gray-50 border border-gray-200
                                  rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      JOIN CODE
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-lg
                                        tracking-widest
                        ${visibleCodes.has(library.id)
                          ? 'text-gray-900'
                          : 'text-gray-300 select-none'
                        }`}>
                        {visibleCodes.has(library.id)
                          ? library.join_code
                          : '••••••••••'
                        }
                      </span>
                      <button
                        onClick={() => toggleCodeVisibility(library.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={visibleCodes.has(library.id)
                          ? 'Hide code'
                          : 'Show code'
                        }
                      >
                        {visibleCodes.has(library.id)
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => copyJoinCode(library)}
                        className="text-gray-400 hover:text-blue-600
                                   transition-colors"
                        title="Copy join code"
                      >
                        {copiedId === library.id
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <Copy className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Toggle active */}
                  <Button
                    size="sm"
                    variant={library.is_active ? 'danger' : 'success'}
                    onClick={() => toggleActive(library)}
                  >
                    {library.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-1">
            No libraries yet
          </h3>
          <p className="text-sm">
            Create the first library to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default LibraryManagement