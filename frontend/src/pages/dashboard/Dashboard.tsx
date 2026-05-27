// Dashboard.tsx
// Shows different content based on user role
// Admin/Librarian — system stats and pending requests
// Member — personal loans, fines, recent books

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, BookOpen, Clock, AlertTriangle,
  DollarSign, BookMarked, CheckCircle,
  ClipboardList, Lightbulb,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import StatCard from '../../components/ui/StatCard'
import { BorrowStatusBadge } from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { getBooksApi } from '../../api/books'
import { getBorrowRecordsApi } from '../../api/borrowing'
import { getFinesApi } from '../../api/fines'
import { getMembersApi } from '../../api/users'
import { formatDate, formatAmount } from '../../utils/helpers'
import { Book, BorrowRecord, Fine, User } from '../../types'

// ============================================================
// Types for dashboard stats
// ============================================================
interface AdminStats {
  totalBooks:       number
  totalMembers:     number
  activeLoans:      number
  pendingRequests:  number
  overdueLoans:     number
  unpaidFines:      number
  unpaidFinesTotal: number
}

interface MemberStats {
  myActiveLoans:  number
  myPendingLoans: number
  myFinesTotal:   number
}

const Dashboard: React.FC = () => {
  const { user, isAdmin, isLibrarian, isMember } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  // Admin / Librarian state
  const [adminStats, setAdminStats]       = useState<AdminStats>({
    totalBooks: 0, totalMembers: 0, activeLoans: 0,
    pendingRequests: 0, overdueLoans: 0,
    unpaidFines: 0, unpaidFinesTotal: 0,
  })
  const [recentRequests, setRecentRequests] = useState<BorrowRecord[]>([])

  // Member state
  const [memberStats, setMemberStats]   = useState<MemberStats>({
    myActiveLoans: 0, myPendingLoans: 0, myFinesTotal: 0,
  })
  const [myBorrows, setMyBorrows]       = useState<BorrowRecord[]>([])
  const [recentBooks, setRecentBooks]   = useState<Book[]>([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {

        if (isAdmin || isLibrarian) {
          // --------------------------------------------------------
          // Load all data for staff dashboard
          // Promise.all runs all requests in parallel — faster
          // --------------------------------------------------------
          const [booksRes, membersRes, borrowsRes, finesRes] =
            await Promise.all([
              getBooksApi(),
              getMembersApi(),
              getBorrowRecordsApi(),
              getFinesApi({ status: 'UNPAID' }),
            ])

          const borrows = borrowsRes.results
          const fines   = finesRes.results

          // Calculate stats from the fetched data
          const active  = borrows.filter(b =>
            ['BORROWED', 'OVERDUE'].includes(b.status)
          )
          const pending = borrows.filter(b => b.status === 'REQUESTED')
          const overdue = borrows.filter(b => b.status === 'OVERDUE')

          const finesTotal = fines.reduce(
            (sum, f) => sum + Number(f.amount), 0
          )

          setAdminStats({
            totalBooks:       booksRes.count,
            totalMembers:     membersRes.count,
            activeLoans:      active.length,
            pendingRequests:  pending.length,
            overdueLoans:     overdue.length,
            unpaidFines:      fines.length,
            unpaidFinesTotal: finesTotal,
          })

          // Show 5 most recent pending requests in table
          setRecentRequests(pending.slice(0, 5))

        } else if (isMember) {
          // --------------------------------------------------------
          // Load member's own data
          // --------------------------------------------------------
          const [borrowsRes, finesRes, booksRes] = await Promise.all([
            getBorrowRecordsApi(),
            getFinesApi({ status: 'UNPAID' }),
            getBooksApi({ ordering: '-created_at', page_size: 6 } as any),
          ])

          const borrows = borrowsRes.results
          const fines   = finesRes.results

          const active  = borrows.filter(b =>
            ['BORROWED', 'OVERDUE'].includes(b.status)
          )
          const pending = borrows.filter(b => b.status === 'REQUESTED')
          const finesTotal = fines.reduce(
            (sum, f) => sum + Number(f.amount), 0
          )

          setMemberStats({
            myActiveLoans:  active.length,
            myPendingLoans: pending.length,
            myFinesTotal:   finesTotal,
          })

          // Show 5 recent borrows in table
          setMyBorrows(borrows.slice(0, 5))

          // Recent books added to library
          setRecentBooks(booksRes.results.slice(0, 6))
        }

      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAdmin, isLibrarian, isMember])

  if (loading) return <Spinner fullScreen />

  return (
    <div>

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin     && 'System Administrator'}
            {isLibrarian && 'Librarian Dashboard'}
            {isMember    && 'Member Dashboard'}
          </p>
        </div>
        <p className="text-sm text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* ============================================================
          ADMIN + LIBRARIAN DASHBOARD
      ============================================================ */}
      {(isAdmin || isLibrarian) && (
        <>
          {/* Row 1 — main stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Books"
              value={adminStats.totalBooks}
              icon={BookOpen}
              color="blue"
              onClick={() => navigate('/books')}
            />
            <StatCard
              title="Total Members"
              value={adminStats.totalMembers}
              icon={Users}
              color="green"
              onClick={() => navigate('/members')}
            />
            <StatCard
              title="Pending Requests"
              value={adminStats.pendingRequests}
              subtitle="awaiting approval"
              icon={ClipboardList}
              color="yellow"
              onClick={() => navigate('/borrow-requests')}
            />
            <StatCard
              title="Active Loans"
              value={adminStats.activeLoans}
              subtitle={`${adminStats.overdueLoans} overdue`}
              icon={BookMarked}
              color="purple"
              onClick={() => navigate('/borrow-requests')}
            />
          </div>

          {/* Row 2 — secondary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3
                          gap-4 mb-6">
            <StatCard
              title="Overdue Loans"
              value={adminStats.overdueLoans}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Unpaid Fines"
              value={adminStats.unpaidFines}
              subtitle={formatAmount(adminStats.unpaidFinesTotal)}
              icon={DollarSign}
              color="red"
              onClick={() => navigate('/fines')}
            />
            <StatCard
              title="Returned Books"
              value={adminStats.activeLoans}
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Recent pending requests table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Pending Requests
              </h2>
              <button
                onClick={() => navigate('/borrow-requests')}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>

            {recentRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2
                                     text-gray-500 font-medium">
                        Member
                      </th>
                      <th className="text-left py-3 px-2
                                     text-gray-500 font-medium">
                        Book
                      </th>
                      <th className="text-left py-3 px-2
                                     text-gray-500 font-medium">
                        Requested
                      </th>
                      <th className="text-left py-3 px-2
                                     text-gray-500 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100
                                   hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate('/borrow-requests')}
                      >
                        <td className="py-3 px-2 font-medium
                                       text-gray-900">
                          {record.member_detail?.username ||
                            `User #${record.member}`}
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {record.book_detail?.title ||
                            `Book #${record.book}`}
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {formatDate(record.request_date)}
                        </td>
                        <td className="py-3 px-2">
                          <BorrowStatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-10 h-10 mx-auto
                                          mb-2 text-gray-300" />
                <p>No pending requests</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================
          MEMBER DASHBOARD
      ============================================================ */}
      {isMember && (
        <>
          {/* Fine alert — show prominently if member owes money */}
          {memberStats.myFinesTotal > 0 && (
            <div className="bg-red-50 border border-red-200
                            rounded-xl p-4 mb-6
                            flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500
                                        flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">
                  Outstanding fine:{' '}
                  {formatAmount(memberStats.myFinesTotal)}
                </p>
                <p className="text-red-600 text-sm">
                  Please visit the library to settle your balance.
                </p>
              </div>
              <button
                onClick={() => navigate('/my-fines')}
                className="ml-auto text-sm text-red-600
                           font-medium hover:underline"
              >
                View details
              </button>
            </div>
          )}

          {/* Member stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3
                          gap-4 mb-6">
            <StatCard
              title="Active Loans"
              value={memberStats.myActiveLoans}
              subtitle="currently borrowed"
              icon={BookMarked}
              color="blue"
              onClick={() => navigate('/my-borrows')}
            />
            <StatCard
              title="Pending Requests"
              value={memberStats.myPendingLoans}
              subtitle="awaiting approval"
              icon={Clock}
              color="yellow"
              onClick={() => navigate('/my-borrows')}
            />
            <StatCard
              title="Outstanding Fines"
              value={formatAmount(memberStats.myFinesTotal)}
              icon={DollarSign}
              color={memberStats.myFinesTotal > 0 ? 'red' : 'green'}
              onClick={() => navigate('/my-fines')}
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent borrows */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Recent Borrows
                </h2>
                <button
                  onClick={() => navigate('/my-borrows')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all
                </button>
              </div>

              {myBorrows.length > 0 ? (
                <div className="space-y-3">
                  {myBorrows.map((record) => (
                    <div
                      key={record.id}
                      className={`
                        flex items-center justify-between
                        p-3 rounded-lg border
                        ${record.is_overdue
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        }
                      `}
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
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-2
                                       text-gray-300" />
                  <p>No borrowing activity yet</p>
                  <button
                    onClick={() => navigate('/books')}
                    className="mt-2 text-sm text-blue-600
                               hover:underline"
                  >
                    Browse books
                  </button>
                </div>
              )}
            </div>

            {/* Recently added books */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recently Added Books
                </h2>
                <button
                  onClick={() => navigate('/books')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Browse all
                </button>
              </div>

              {recentBooks.length > 0 ? (
                <div className="space-y-2">
                  {recentBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => navigate(`/books/${book.id}`)}
                      className="flex items-center gap-3 p-2
                                 rounded-lg hover:bg-gray-50
                                 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg
                                      bg-blue-100 flex items-center
                                      justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium
                                      text-gray-900 truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {book.author}
                        </p>
                      </div>
                      {book.is_available ? (
                        <span className="badge-success text-xs
                                         flex-shrink-0">
                          Available
                        </span>
                      ) : (
                        <span className="badge-danger text-xs
                                         flex-shrink-0">
                          Unavailable
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-2
                                       text-gray-300" />
                  <p>No books added recently</p>
                </div>
              )}
            </div>
          </div>

          {/* Suggest a book banner */}
          <div className="mt-6 bg-blue-50 border border-blue-200
                          rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl
                            flex items-center justify-center
                            flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">
                Can't find a book you want?
              </p>
              <p className="text-blue-700 text-sm">
                Suggest it to the library and we might add it!
              </p>
            </div>
            <button
              onClick={() => navigate('/suggestions')}
              className="ml-auto btn-primary text-sm"
            >
              Suggest a Book
            </button>
          </div>
        </>
      )}

    </div>
  )
}

export default Dashboard