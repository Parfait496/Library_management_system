import React, { useEffect, useState } from 'react'
import { DollarSign, AlertTriangle } from 'lucide-react'
import { getFinesApi } from '../../api/fines'
import { Fine } from '../../types'
import { FineStatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate, formatAmount } from '../../utils/helpers'

const MyFines: React.FC = () => {
  const [fines, setFines]   = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFinesApi()
        setFines(data.results)
      } catch (err) {
        console.error('Failed to load fines:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalUnpaid = fines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Fines
      </h1>

      {/* Outstanding balance alert */}
      {totalUnpaid > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl
                        p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500
                                    flex-shrink-0" />
          <div>
            <p className="text-red-800 font-semibold">
              Outstanding Balance: {formatAmount(totalUnpaid)}
            </p>
            <p className="text-red-600 text-sm">
              Please visit the library to settle your fines.
            </p>
          </div>
        </div>
      )}

      {/* Fines table */}
      <div className="card p-0 overflow-hidden">
        {fines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Book</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Days Overdue</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Issued</th>
                  <th className="text-left py-3 px-4 text-gray-500
                                 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.id}
                      className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {fine.book_title}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {fine.days_overdue} days
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
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(fine.resolved_date)}
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
            <p>No fines on record</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyFines