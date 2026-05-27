// VerifyEmail.tsx
// User enters the 6-digit code sent to their email after registration

import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { BookOpen, Mail, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const VerifyEmail: React.FC = () => {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Email passed from register page via navigation state
  const email = (location.state as any)?.email || ''

  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await api.post('/auth/verify-email/', { token: code })
      navigate('/login', {
        state: {
          message: 'Email verified! You can now log in.'
        }
      })
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Invalid code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    try {
      await api.post('/auth/resend-verification/', { email })
      setSuccess('Verification code resent! Check your email.')
    } catch (err) {
      setError('Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verify your email
          </h1>
          <p className="text-gray-500 mt-2">
            We sent a 6-digit code to
          </p>
          {email && (
            <p className="font-medium text-gray-700">{email}</p>
          )}
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
              <Alert type="success" message={success}
                     onClose={() => setSuccess(null)} />
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">

            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Verification Code
              </label>
              {/* Large input for the 6-digit code */}
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  // Only allow digits, max 6 characters
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(val)
                }}
                placeholder="000000"
                className="input-field text-center text-2xl
                           font-bold tracking-widest"
                maxLength={6}
                autoFocus
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={code.length !== 6}
            >
              <Mail className="w-4 h-4" />
              Verify Email
            </Button>

          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Didn't receive the code?
            </p>
            <Button
              variant="secondary"
              onClick={handleResend}
              loading={resending}
            >
              <RefreshCw className="w-4 h-4" />
              Resend Code
            </Button>

            <p className="text-sm text-gray-500">
              <Link to="/login"
                    className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </p>
          </div>

        </div>

        {/* Dev helper — shown only when console email backend */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200
                        rounded-lg text-sm text-yellow-800">
          <strong>Development mode:</strong> Check{' '}
          <code>docker-compose logs backend</code> for the code.
        </div>

      </div>
    </div>
  )
}

export default VerifyEmail