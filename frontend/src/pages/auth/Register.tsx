import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { registerApi } from '../../api/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const Register: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username:     '',
    email:        '',
    first_name:   '',
    last_name:    '',
    password:     '',
    password2:    '',
    phone_number: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setFieldErrors({})

  if (formData.password !== formData.password2) {
    setFieldErrors({ password2: 'Passwords do not match.' })
    return
  }

  setLoading(true)

  try {
    await registerApi(formData)
    navigate('/verify-email', {
      state: { email: formData.email }
    })
  } catch (err: any) {
    const data = err.response?.data

    if (!err.response) {
      setError('Cannot connect to server. Please check your connection.')
      return
    }

    if (data && typeof data === 'object') {
      const errors: Record<string, string> = {}
      Object.entries(data).forEach(([key, value]) => {
        errors[key] = Array.isArray(value)
          ? value[0]
          : String(value)
      })
      setFieldErrors(errors)

      // Show first error as main error message
      const firstError = Object.values(errors)[0]
      if (firstError) setError(firstError)
    } else {
      setError('Registration failed. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create account
          </h1>
          <p className="text-gray-500 mt-1">
            Join the library today
          </p>
        </div>

        <div className="card">

          {error && (
            <div className="mb-4">
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
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
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              required
            />

            <Input
              label="Phone Number"
              name="phone_number"
              placeholder="+250 7XX XXX XXX"
              value={formData.phone_number}
              onChange={handleChange}
              error={fieldErrors.phone_number}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="password2"
              placeholder="Repeat your password"
              value={formData.password2}
              onChange={handleChange}
              error={fieldErrors.password2}
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Create Account
            </Button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register