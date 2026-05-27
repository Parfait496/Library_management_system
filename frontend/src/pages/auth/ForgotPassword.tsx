import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep]     = useState<'email' | 'reset'>('email')
  const [email, setEmail]   = useState('')
  const [token, setToken]   = useState('')
  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/forgot-password/', { email })
      setSuccess('Check your email for the reset code.')
      setStep('reset')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/reset-password/', { token, password })
      navigate('/login', {
        state: { message: 'Password reset! You can now log in.' }
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'email'
              ? 'Enter your email to receive a reset code'
              : 'Enter the code and your new password'
            }
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error}
                     onClose={() => setError(null)} />
            </div>
          )}
          {success && (
            <div className="mb-4">
              <Alert type="success" message={success} />
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
              />
              <Button type="submit" fullWidth loading={loading}>
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="000000"
                  className="input-field text-center text-2xl
                             font-bold tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <Button type="submit" fullWidth loading={loading}>
                Reset Password
              </Button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-sm text-gray-500
                           hover:text-gray-700 flex items-center
                           justify-center gap-1 mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login"
                  className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword