import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, UserPlus, Users,
  Eye, Trash2, Shield, BookOpen
} from 'lucide-react'
import { getUsersApi, deleteUserApi } from '../../api/users'
import { User } from '../../types'
import useAuth from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import { formatDate, getDisplayName } from '../../utils/helpers'

const UsersList: React.FC = () => {
  const navigate           = useNavigate()
  const { isAdmin }        = useAuth()
  const [users, setUsers]  = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]  = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [total, setTotal]  = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsersApi({
        search:  search || undefined,
        role:    roleFilter || undefined,
        page_size: 100,
      } as any)
      setUsers(data.results)
      setTotal(data.count)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async (user: User) => {
    if (!window.confirm(
      `Delete ${getDisplayName(user)}? This cannot be undone.`
    )) return
    try {
      await deleteUserApi(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch {
      setError('Failed to delete user.')
    }
  }

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN:     'bg-red-100 text-red-700',
      LIBRARIAN: 'bg-blue-100 text-blue-700',
      MEMBER:    'bg-green-100 text-green-700',
    }
    return map[role] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div>
      {/* Header — stacks vertically on mobile instead of squeezing
          the title and button onto one line */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Users
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} user{total !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <Button onClick={() => navigate('/users/create')}>
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error}
                 onClose={() => setError(null)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username, student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        {isAdmin && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-full sm:w-44"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="LIBRARIAN">Librarian</option>
            <option value="MEMBER">Member</option>
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium
                                 text-gray-500">User</th>
                  <th className="text-left py-3 px-4 font-medium
                                 text-gray-500">Student ID</th>
                  <th className="text-left py-3 px-4 font-medium
                                 text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium
                                 text-gray-500">Joined</th>
                  <th className="text-left py-3 px-4 font-medium
                                 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}
                      className="border-b border-gray-100
                                 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full
                                        bg-blue-100 flex items-center
                                        justify-center flex-shrink-0
                                        overflow-hidden">
                          {user.profile_picture_url ? (
                            <img
                              src={user.profile_picture_url}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-700 font-semibold
                                             text-sm">
                              {user.first_name?.[0] ||
                                user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {getDisplayName(user)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{user.username}
                            {user.email && ` • ${user.email}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {user.student_id || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5
                                       py-1 rounded-full
                                       ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            navigate(`/users/${user.id}`)
                          }
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {search ? `No users found for "${search}"` : 'No users yet.'}
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/users/create')}
          >
            <UserPlus className="w-4 h-4" />
            Add First User
          </Button>
        </div>
      )}
    </div>
  )
}

export default UsersList