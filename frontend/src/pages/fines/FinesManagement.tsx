import React, { useEffect, useState, useCallback } from 'react'
import { DollarSign } from 'lucide-react'
import { getFinesApi, resolveFineApi } from '../../api/fines'
import { Fine } from '../../types'
import { FineStatusBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'
import { formatDate, formatAmount } from '../../utils/helpers'

const FinesManagement: React.FC = () => {
  const [fines, setFines]     = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'unpaid' | 'all'>('unpaid')

  const loadFines = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFinesApi(
        activeTab === 'unpaid' ? { status: 'UNPAID' } : undefined
      )
      setFines(data.results)
    } catch (err) {
      setError('Failed to load fines.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { loadFines() }, [loadFines])

  const handleResolve = async (
    id: number,
    action: 'paid' | 'waive'
  ) => {
    setActionId(id)
    setError(null)
    try {
      await resolveFineApi(id, action)
      setSuccess(
        action === 'paid'
          ? 'Fine marked as paid.'
          : 'Fine waived successfully.'
      )
      await loadFines()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Action failed.')
    } finally {
      setActionId(null)
    }
  }

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Fines Management
      </h1>

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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg
                      w-fit">
        {(['unpaid', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium
              transition-colors duration-150 capitalize
              ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab === 'unpaid' ? 'Unpaid' : 'All Fines'}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {fines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Member</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Book</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Days</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Issued</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.id}
                      className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {fine.member_username}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {fine.book_title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {fine.days_overdue}d
                    </td>
                    <td className="py-3 px-4">
                      <span className={
                        fine.status === 'UNPAID'
                          ? 'text-red-600 font-semibold'
                          : 'text-gray-600'
                      }>
                        {formatAmount(fine.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <FineStatusBadge status={fine.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(fine.issued_date)}
                    </td>
                    <td className="py-3 px-4">
                      {fine.status === 'UNPAID' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            loading={actionId === fine.id}
                            onClick={() =>
                              handleResolve(fine.id, 'paid')
                            }
                          >
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionId === fine.id}
                            onClick={() =>
                              handleResolve(fine.id, 'waive')
                            }
                          >
                            Waive
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-10 h-10 mx-auto mb-2
                                   text-gray-300" />
            <p>No fines found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinesManagement