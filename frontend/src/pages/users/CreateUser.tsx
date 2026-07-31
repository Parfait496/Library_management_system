import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { createUserApi } from '../../api/users'
import { UserRole } from '../../types'
import useAuth from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const CreateUser: React.FC = () => {
  const navigate       = useNavigate()
  const { isAdmin }    = useAuth()

  const [formData, setFormData] = useState({
    username:     '',
    email:        '',
    first_name:   '',
    last_name:    '',
    password:     '',
    role:         'MEMBER' as UserRole,
    phone_number: '',
    student_id:   '',
    address:      '',
  })

  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    setSuccess(null)
    setFieldErrors({})
    setLoading(true)

    try {
      const created = await createUserApi(formData)
      setSuccess(
        `Account created successfully for ${created.full_name || created.username}!`
      )
      // Reset form
      setFormData({
        username: '', email: '', first_name: '',
        last_name: '', password: '', role: 'MEMBER',
        phone_number: '', student_id: '', address: '',
      })
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const errors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value)
        })
        setFieldErrors(errors)
        setError('Please fix the errors below.')
      } else {
        setError('Failed to create user. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-gray-500
                   hover:text-gray-700 mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Account
      </h1>

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

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role selector — only admin can create librarians */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="MEMBER">Member (Student)</option>
                <option value="LIBRARIAN">Librarian</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'MEMBER'
                  ? 'Members can browse books and request borrows.'
                  : 'Librarians can manage books, members, and borrows.'
                }
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
              error={fieldErrors.first_name}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              error={fieldErrors.last_name}
              required
            />
          </div>

          <Input
            label="Username"
            name="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            error={fieldErrors.username}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="john@asome.ac"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
          />

          {/* Student ID — only for members */}
          {formData.role === 'MEMBER' && (
            <Input
              label="Student ID"
              name="student_id"
              placeholder="ASOME-2024-001"
              value={formData.student_id}
              onChange={handleChange}
              error={fieldErrors.student_id}
            />
          )}

          <Input
            label="Phone Number"
            name="phone_number"
            placeholder="+250 7XX XXX XXX"
            value={formData.phone_number}
            onChange={handleChange}
            error={fieldErrors.phone_number}
          />

          <Input
            label="Temporary Password"
            type="password"
            name="password"
            placeholder="Set a temporary password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            hint="The user can change this after first login."
            required
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              <UserPlus className="w-4 h-4" />
              Create Account
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/members')}
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateUser