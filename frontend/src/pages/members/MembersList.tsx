import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Eye } from 'lucide-react'
import { getMembersApi } from '../../api/users'
import { User } from '../../types'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'

const MembersList: React.FC = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [total, setTotal]     = useState(0)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMembersApi({
        search: search || undefined
      })
      setMembers(data.results)
      setTotal(data.count)
    } catch (err) {
      console.error('Failed to load members:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => loadMembers(), 400)
    return () => clearTimeout(timer)
  }, [loadMembers])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 mt-1">
            {total} member{total !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Member</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Joined</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}
                        className="border-b border-gray-100
                                   hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar with initials */}
                          <div className="w-8 h-8 rounded-full
                                          bg-blue-100 flex items-center
                                          justify-center text-blue-700
                                          text-sm font-semibold
                                          flex-shrink-0">
                            {member.first_name?.[0] ||
                              member.username[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{member.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {member.email}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {member.phone_number || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            navigate(`/members/${member.id}`)
                          }
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>
                {search
                  ? `No members found for "${search}"`
                  : 'No members registered yet'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MembersList