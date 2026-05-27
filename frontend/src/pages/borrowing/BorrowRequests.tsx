// BorrowRequests.tsx
// Librarian/Admin page to manage all borrow requests
// Shows pending, active, and all records with action buttons

import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Check, X, BookMarked } from 'lucide-react'
import {
  getBorrowRecordsApi,
  approveRequestApi,
  rejectRequestApi,
  markBorrowedApi,
  markReturnedApi,
} from '../../api/borrowing'
import { BorrowRecord } from '../../types'
import { BorrowStatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import { formatDate, formatAmount } from '../../utils/helpers'

// Tab type — defines which records to show
type TabKey = 'pending' | 'active' | 'all'

const BorrowRequests: React.FC = () => {
  const [records, setRecords]     = useState<BorrowRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [actionId, setActionId]   = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('pending')

  // Load all borrow records from API
  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBorrowRecordsApi()
      setRecords(data.results)
    } catch (err) {
      setError('Failed to load records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Filter records based on active tab
  const filteredRecords = records.filter((r) => {
    if (activeTab === 'pending') return r.status === 'REQUESTED'
    if (activeTab === 'active')
      return ['APPROVED', 'BORROWED', 'OVERDUE'].includes(r.status)
    return true // 'all' tab shows everything
  })

  // Handle approve, reject, mark borrowed, mark returned
  const handleAction = async (id: number, action: 'approve' | 'reject' | 'borrowed' | 'returned') => {
    setActionId(id)
    setError(null)
    setSuccess(null)

    try {
      if (action === 'approve')  await approveRequestApi(id)
      if (action === 'reject')   await rejectRequestApi(id)
      if (action === 'borrowed') await markBorrowedApi(id)
      if (action === 'returned') await markReturnedApi(id)

      setSuccess('Action completed successfully.')
      await loadRecords() // refresh the list
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Action failed. Please try again.'
      )
    } finally {
      setActionId(null)
    }
  }

  // Tab definitions with counts
  const tabs: { key: TabKey; label: string; count: number }[] = [
    {
      key: 'pending',
      label: 'Pending',
      count: records.filter((r) => r.status === 'REQUESTED').length,
    },
    {
      key: 'active',
      label: 'Active',
      count: records.filter((r) =>
        ['APPROVED', 'BORROWED', 'OVERDUE'].includes(r.status)
      ).length,
    },
    {
      key: 'all',
      label: 'All',
      count: records.length,
    },
  ]

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Borrow Requests
      </h1>

      {/* Error and success alerts */}
      {error && (
        <div className="mb-4">
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-150
              ${activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
            <span
              className={`
                ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Records table */}
      <div className="card p-0 overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Book
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Fine
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`
                      border-b border-gray-100
                      ${record.is_overdue ? 'bg-red-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    {/* Member info */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {record.member_detail?.username || `User #${record.member}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.member_detail?.email || ''}
                      </p>
                    </td>

                    {/* Book info */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {record.book_detail?.title || `Book #${record.book}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.book_detail?.author || ''}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <BorrowStatusBadge status={record.status} />
                    </td>

                    {/* Due date */}
                    <td className="py-3 px-4 text-gray-500">
                      {record.due_date ? (
                        <div>
                          <p>{formatDate(record.due_date)}</p>
                          {record.is_overdue && (
                            <p className="text-xs text-red-600 font-medium">
                              {record.days_overdue}d overdue
                            </p>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Fine amount */}
                    <td className="py-3 px-4">
                      {record.fine_amount > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatAmount(record.fine_amount)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">

                        {/* REQUESTED — show approve and reject */}
                        {record.status === 'REQUESTED' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              loading={actionId === record.id}
                              onClick={() => handleAction(record.id, 'approve')}
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={actionId === record.id}
                              onClick={() => handleAction(record.id, 'reject')}
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </Button>
                          </>
                        )}

                        {/* APPROVED — show mark as borrowed */}
                        {record.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            loading={actionId === record.id}
                            onClick={() => handleAction(record.id, 'borrowed')}
                          >
                            <BookMarked className="w-3 h-3" />
                            Mark Borrowed
                          </Button>
                        )}

                        {/* BORROWED or OVERDUE — show mark as returned */}
                        {(record.status === 'BORROWED' ||
                          record.status === 'OVERDUE') && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionId === record.id}
                            onClick={() => handleAction(record.id, 'returned')}
                          >
                            <Check className="w-3 h-3" />
                            Mark Returned
                          </Button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12 text-gray-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No records found</p>
            <p className="text-sm mt-1">
              {activeTab === 'pending'
                ? 'No pending requests at the moment'
                : 'No records in this category'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BorrowRequests