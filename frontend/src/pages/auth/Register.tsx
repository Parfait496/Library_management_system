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
    join_code:    '',
  })

  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!err.response) {
        setError('Cannot connect to server.')
        return
      }
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const errors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value)
        })
        setFieldErrors(errors)
        const first = Object.values(errors)[0]
        if (first) setError(first)
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

        {/* Back */}
        <div className="mb-4">
          <Link to="/"
                className="inline-flex items-center gap-1.5 text-sm
                           text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create account
          </h1>
          <p className="text-gray-500 mt-1">Join your library today</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error}
                     onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

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

            {/* Library Join Code */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Library Join Code
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                name="join_code"
                value={formData.join_code}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  join_code: e.target.value.toUpperCase()
                }))}
                placeholder="e.g. UNIV2025"
                className="input-field font-mono tracking-widest
                           uppercase"
                maxLength={20}
              />
              {fieldErrors.join_code ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.join_code}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Ask your librarian for the join code to access
                  your library's catalogue.
                </p>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login"
                  className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register