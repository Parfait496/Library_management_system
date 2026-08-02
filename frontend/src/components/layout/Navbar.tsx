import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { downloadSnapshotApi } from '../../api/export'
import {
  BookOpen, LayoutDashboard, Clock,
  Users, ClipboardList,
  DollarSign, LogOut, User, Menu,
  X, ChevronDown, Lightbulb, Download,
  Database, History,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'

interface NavLink {
  label: string
  path:  string
  icon:  React.ReactNode
}

const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isLibrarian, isMember } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(path + '/')

  // Common links — all logged in users
  const commonLinks: NavLink[] = [
    {
      label: 'Dashboard',
      path:  '/dashboard',
      icon:  <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Books',
      path:  '/books',
      icon:  <BookOpen className="w-4 h-4" />,
    },
  ]

  // Member only
  const memberLinks: NavLink[] = [
    {
      label: 'My Borrows',
      path:  '/my-borrows',
      icon:  <Clock className="w-4 h-4" />,
    },
    {
      label: 'My Fines',
      path:  '/my-fines',
      icon:  <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Suggest Book',
      path:  '/suggestions',
      icon:  <Lightbulb className="w-4 h-4" />,
    },
  ]

  // Staff links — librarian and admin
  // NOTE: "Add Book", "Import Books", and "Genres" now live as buttons
  // on the Books page (/books) instead of separate nav items.
  // "Add User" now lives as a button on the Members page (/members).
  const staffLinks: NavLink[] = [
    {
      label: 'Requests',
      path:  '/borrow-requests',
      icon:  <ClipboardList className="w-4 h-4" />,
    },
    {
      label: 'Members',
      path:  '/members',
      icon:  <Users className="w-4 h-4" />,
    },
    {
      label: 'Fines',
      path:  '/fines',
      icon:  <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Suggestions',
      path:  '/suggestions',
      icon:  <Lightbulb className="w-4 h-4" />,
    },
  ]

  const navLinks: NavLink[] = [
    ...commonLinks,
    ...(isMember                    ? memberLinks : []),
    ...(isLibrarian || isAdmin      ? staffLinks  : []),
  ]

  const roleColor = {
    ADMIN:     'bg-red-100 text-red-700',
    LIBRARIAN: 'bg-blue-100 text-blue-700',
    MEMBER:    'bg-green-100 text-green-700',
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl
                            flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 text-sm leading-none">
                ASOME Library
              </p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                Management System
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-xs font-medium whitespace-nowrap transition-colors
                  ${isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* User dropdown */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2
                           rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-600
                                flex items-center justify-center
                                overflow-hidden flex-shrink-0">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  )}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900
                                leading-none">
                    {user?.first_name || user?.username}
                  </p>
                  {user?.role && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full
                                     font-medium
                                     ${roleColor[user.role]}`}>
                      {user.role}
                    </span>
                  )}
                </div>

                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white
                             rounded-xl shadow-lg border border-gray-200
                             py-1 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2
                               text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <>
                      <hr className="my-1 border-gray-100" />
                      <p className="px-4 pt-1 pb-1.5 text-[10px] font-semibold
                                    text-gray-400 uppercase tracking-wide">
                        Admin Tools
                      </p>
                      <button
                        onClick={() => { setDropdownOpen(false); downloadSnapshotApi() }}
                        className="flex items-center gap-2 px-4 py-2 text-sm
                                   text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Download className="w-4 h-4" />
                        Export Data (.xlsx)
                      </button>
                      <Link
                        to="/backups"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm
                                   text-gray-700 hover:bg-gray-50"
                      >
                        <Database className="w-4 h-4" />
                        Backups
                      </Link>
                      <Link
                        to="/activity-log"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm
                                   text-gray-700 hover:bg-gray-50"
                      >
                        <History className="w-4 h-4" />
                        Activity Log
                      </Link>
                    </>
                  )}

                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2
                               text-sm text-red-600 hover:bg-red-50
                               w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen
              ? <X className="w-6 h-6" />
              : <Menu className="w-6 h-6" />
            }
          </button>

        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200
                        bg-white px-4 py-3 max-h-96
                        overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <hr className="my-2 border-gray-100" />

            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5
                         rounded-lg text-sm text-gray-600
                         hover:bg-gray-100"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5
                         rounded-lg text-sm text-red-600
                         hover:bg-red-50 w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar