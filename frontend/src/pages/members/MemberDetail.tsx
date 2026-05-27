import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, DollarSign } from 'lucide-react'
import { getMemberApi } from '../../api/users'
import { getBorrowRecordsApi } from '../../api/borrowing'
import { getFinesApi } from '../../api/fines'
import { BorrowRecord, Fine, User } from '../../types'
import { BorrowStatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate, formatAmount, getDisplayName } from '../../utils/helpers'

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [member, setMember]   = useState<User | null>(null)
  const [borrows, setBorrows] = useState<BorrowRecord[]>([])
  const [fines, setFines]     = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [memberData, borrowsData, finesData] = await Promise.all([
          getMemberApi(Number(id)),
          getBorrowRecordsApi(),
          getFinesApi(),
        ])
        setMember(memberData)
        // Filter to this member's records
        setBorrows(
          borrowsData.results.filter(b => b.member === Number(id))
        )
        setFines(
          finesData.results.filter(f => f.member === Number(id))
        )
      } catch (err) {
        console.error('Failed to load member:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Spinner fullScreen />
  if (!member) return (
    <div className="text-center py-16 text-gray-500">
      Member not found.
    </div>
  )

  const totalUnpaid = fines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  const activeBorrows = borrows.filter(b =>
    ['REQUESTED', 'APPROVED', 'BORROWED', 'OVERDUE'].includes(b.status)
  )

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-gray-500
                   hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — profile card */}
        <div className="lg:col-span-1 space-y-4">

          {/* Profile */}
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100
                              flex items-center justify-center
                              text-blue-700 text-2xl font-bold">
                {member.first_name?.[0] || member.username[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {getDisplayName(member)}
                </h2>
                <p className="text-gray-500 text-sm">
                  @{member.username}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <InfoRow label="Email" value={member.email} />
              <InfoRow
                label="Phone"
                value={member.phone_number || '—'}
              />
              <InfoRow
                label="Joined"
                value={formatDate(member.created_at)}
              />
            </div>
          </div>

          {/* Fines summary */}
          <div className={`card border-2 ${
            totalUnpaid > 0
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-3
                           flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Fines Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fines</span>
                <span className="font-medium">{fines.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding</span>
                <span className={`font-semibold ${
                  totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatAmount(totalUnpaid)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — borrow records */}
        <div className="lg:col-span-2 space-y-4">

          {/* Active loans */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4
                           flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Active Loans
              <span className="ml-auto text-sm font-normal
                               text-gray-500">
                {activeBorrows.length}
              </span>
            </h3>

            {activeBorrows.length > 0 ? (
              <div className="space-y-3">
                {activeBorrows.map(record => (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between
                                p-3 rounded-lg border
                      ${record.is_overdue
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {record.book_detail?.title ||
                          `Book #${record.book}`}
                      </p>
                      {record.due_date && (
                        <p className="text-xs text-gray-500">
                          Due: {formatDate(record.due_date)}
                          {record.is_overdue && (
                            <span className="text-red-600 ml-1">
                              ({record.days_overdue}d overdue)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <BorrowStatusBadge status={record.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No active loans
              </p>
            )}
          </div>

          {/* Borrow history */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">
              Borrow History ({borrows.length})
            </h3>

            {borrows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-gray-500
                                     font-medium">Book</th>
                      <th className="text-left py-2 px-2 text-gray-500
                                     font-medium">Status</th>
                      <th className="text-left py-2 px-2 text-gray-500
                                     font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.map(record => (
                      <tr key={record.id}
                          className="border-b border-gray-100">
                        <td className="py-2 px-2 font-medium
                                       text-gray-900">
                          {record.book_detail?.title ||
                            `Book #${record.book}`}
                        </td>
                        <td className="py-2 px-2">
                          <BorrowStatusBadge status={record.status} />
                        </td>
                        <td className="py-2 px-2 text-gray-500">
                          {formatDate(record.request_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No borrow history
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label, value
}) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
)

export default MemberDetail