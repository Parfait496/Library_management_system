import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { ArrowLeft } from 'lucide-react'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const from           = (location.state as any)?.from?.pathname || '/dashboard'
  const successMessage = (location.state as any)?.message || null

  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    await login({ username, password })
    navigate(from, { replace: true })
  } catch (err: any) {
    // Handle different error types
    if (err.response?.status === 401) {
      setError('Invalid username or password. Please try again.')
    } else if (err.response?.status === 400) {
      const data = err.response.data
      if (data.detail) {
        setError(data.detail)
      } else if (data.non_field_errors) {
        setError(data.non_field_errors[0])
      } else {
        setError('Invalid credentials.')
      }
    } else if (err.response?.status === 0 || !err.response) {
      setError('Cannot connect to server. Please check your connection.')
    } else {
      setError('Something went wrong. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md">

        {/* Back to home */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm
                     text-gray-500 hover:text-gray-700
                     transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center
                            w-14 h-14 bg-blue-600 rounded-2xl mb-4
                            hover:bg-blue-700 transition-colors">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to your library account
          </p>
        </div>

        <div className="card">

          {/* Success message from verify/reset */}
          {successMessage && (
            <div className="mb-4">
              <Alert type="success" message={successMessage} />
            </div>
          )}

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error}
                     onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400
                           hover:text-gray-600 transition-colors"
              >
                {showPassword
                  ? <EyeOff className="w-5 h-5" />
                  : <Eye className="w-5 h-5" />
                }
              </button>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register"
                  className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login