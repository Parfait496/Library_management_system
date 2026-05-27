import React, { useState, useRef } from 'react'
import { Camera, Save, Lock, User, Mail, Phone, MapPin } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { updateProfileApi, changePasswordApi } from '../../api/users'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import api from '../../api/axios'

const MyProfile: React.FC = () => {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'profile' | 'password'>('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [profileData, setProfileData] = useState({
    first_name:   user?.first_name  || '',
    last_name:    user?.last_name   || '',
    email:        user?.email       || '',
    phone_number: user?.phone_number || '',
    address:      user?.address     || '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password:  '',
    new_password:  '',
    new_password2: '',
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

 const handleProfileSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setSuccess(null)

  try {
    const formData = new FormData()

    // Append text fields
    formData.append('first_name', profileData.first_name)
    formData.append('last_name',  profileData.last_name)
    formData.append('email',      profileData.email)
    if (profileData.phone_number) {
      formData.append('phone_number', profileData.phone_number)
    }
    if (profileData.address) {
      formData.append('address', profileData.address)
    }

    // Append image file if selected
    if (avatarFile) {
      formData.append('profile_picture', avatarFile)
    }

    await api.patch('/users/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    setSuccess('Profile updated successfully!')
    // Refresh avatar
    if (avatarFile) {
      setAvatarPreview(URL.createObjectURL(avatarFile))
    }
  } catch (err: any) {
    const data = err.response?.data
    if (data && typeof data === 'object') {
      const msg = Object.values(data).flat().join(', ')
      setError(msg)
    } else {
      setError('Failed to update profile.')
    }
  } finally {
    setLoading(false)
  }
}

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.new_password2) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await changePasswordApi(passwordData)
      setSuccess('Password changed successfully!')
      setPasswordData({ old_password: '', new_password: '', new_password2: '' })
    } catch (err: any) {
      setError(
        err.response?.data?.old_password ||
        err.response?.data?.new_password ||
        'Failed to change password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const avatarSrc = avatarPreview ||
    (user as any)?.profile_picture_url ||
    null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Profile
      </h1>

      {/* Avatar section */}
      <div className="card mb-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-100
                          flex items-center justify-center
                          overflow-hidden">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-2xl">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600
                       rounded-full flex items-center justify-center
                       text-white hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-3 h-3" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-gray-500 text-sm">@{user?.username}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${user?.role === 'ADMIN'
              ? 'bg-red-100 text-red-700'
              : user?.role === 'LIBRARIAN'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
            }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2 rounded-md text-sm font-medium
            transition-colors
            ${tab === 'profile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <User className="w-4 h-4 inline mr-1" />
          Profile Info
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-2 rounded-md text-sm font-medium
            transition-colors
            ${tab === 'password'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Lock className="w-4 h-4 inline mr-1" />
          Change Password
        </button>
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

      {/* Profile form */}
      {tab === 'profile' && (
        <div className="card">
          <form onSubmit={handleProfileSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profileData.first_name}
                onChange={(e) =>
                  setProfileData(p => ({
                    ...p, first_name: e.target.value
                  }))
                }
              />
              <Input
                label="Last Name"
                value={profileData.last_name}
                onChange={(e) =>
                  setProfileData(p => ({
                    ...p, last_name: e.target.value
                  }))
                }
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData(p => ({ ...p, email: e.target.value }))
              }
            />

            {/* Read-only fields */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Username
              </label>
              <input
                value={user?.username || ''}
                disabled
                className="input-field bg-gray-50 text-gray-500
                           cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Username cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Role
              </label>
              <input
                value={user?.role || ''}
                disabled
                className="input-field bg-gray-50 text-gray-500
                           cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Role is assigned by administrators
              </p>
            </div>

            <Input
              label="Phone Number"
              value={profileData.phone_number}
              onChange={(e) =>
                setProfileData(p => ({
                  ...p, phone_number: e.target.value
                }))
              }
              placeholder="+250 7XX XXX XXX"
            />

            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) =>
                  setProfileData(p => ({
                    ...p, address: e.target.value
                  }))
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Your address"
              />
            </div>

            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>

          </form>
        </div>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <div className="card">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.old_password}
              onChange={(e) =>
                setPasswordData(p => ({
                  ...p, old_password: e.target.value
                }))
              }
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData(p => ({
                  ...p, new_password: e.target.value
                }))
              }
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.new_password2}
              onChange={(e) =>
                setPasswordData(p => ({
                  ...p, new_password2: e.target.value
                }))
              }
              required
            />
            <Button type="submit" loading={loading}>
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default MyProfile