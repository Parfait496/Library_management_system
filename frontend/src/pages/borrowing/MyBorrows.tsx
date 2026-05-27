import React, { useEffect, useState } from 'react'
import { BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getBorrowRecordsApi } from '../../api/borrowing'
import { BorrowRecord } from '../../types'
import { BorrowStatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate, formatAmount } from '../../utils/helpers'

const MyBorrows: React.FC = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBorrowRecordsApi()
        setRecords(data.results)
      } catch (err) {
        console.error('Failed to load borrows:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Split into active and history
  const active = records.filter(r =>
    ['REQUESTED', 'APPROVED', 'BORROWED', 'OVERDUE'].includes(r.status)
  )
  const history = records.filter(r =>
    ['RETURNED', 'REJECTED'].includes(r.status)
  )

  if (loading) return <Spinner fullScreen />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Borrows
      </h1>

      {/* Active loans */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4
                       flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Active Loans & Requests
          <span className="ml-auto text-sm font-normal text-gray-500">
            {active.length} item{active.length !== 1 ? 's' : ''}
          </span>
        </h2>

        {active.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Book</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Requested</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Due Date</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Fine</th>
                </tr>
              </thead>
              <tbody>
                {active.map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-gray-100
                      ${record.is_overdue ? 'bg-red-50' : ''}
                    `}
                  >
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900">
                        {record.book_detail?.title ||
                          `Book #${record.book}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.book_detail?.author}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <BorrowStatusBadge status={record.status} />
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {formatDate(record.request_date)}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {record.due_date ? (
                        <div>
                          <p>{formatDate(record.due_date)}</p>
                          {record.is_overdue && (
                            <p className="text-xs text-red-600">
                              {record.days_overdue} days overdue
                            </p>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-2">
                      {record.fine_amount > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatAmount(record.fine_amount)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No active loans or requests</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4
                       flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Borrowing History
          <span className="ml-auto text-sm font-normal text-gray-500">
            {history.length} item{history.length !== 1 ? 's' : ''}
          </span>
        </h2>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Book</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Borrowed</th>
                  <th className="text-left py-3 px-2 text-gray-500
                                 font-medium">Returned</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id}
                      className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900">
                        {record.book_detail?.title ||
                          `Book #${record.book}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.book_detail?.author}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <BorrowStatusBadge status={record.status} />
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {formatDate(record.borrow_date)}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {formatDate(record.return_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <XCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No borrowing history yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBorrows