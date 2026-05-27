import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  BookOpen,
  LayoutDashboard,
  Clock,
  Users,
  BookPlus,
  ClipboardList,
  DollarSign,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Tag,
  Lightbulb,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'

// Single nav link type
interface NavLink {
  label: string
  path: string
  icon: React.ReactNode
}

const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isLibrarian, isMember } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Mobile menu open/close
  const [mobileOpen, setMobileOpen] = useState(false)

  // User dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Check if a link is currently active
  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(path + '/')

  // =========================================================================
  // BUILD NAV LINKS BASED ON ROLE
  // =========================================================================

  const commonLinks: NavLink[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Books',
      path: '/books',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ]

  const memberLinks: NavLink[] = [
    {
      label: 'My Borrows',
      path: '/my-borrows',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: 'Suggest Book',
      path: '/suggestions',
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      label: 'My Fines',
      path: '/my-fines',
      icon: <DollarSign className="w-4 h-4" />,
    },
  ]

  const staffLinks: NavLink[] = [
    {
      label: 'Add Book',
      path: '/books/add',
      icon: <BookPlus className="w-4 h-4" />,
    },
    {
      label: 'Genres',
      path: '/genres',
      icon: <Tag className="w-4 h-4" />,
    },
    {
      label: 'Requests',
      path: '/borrow-requests',
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      label: 'Fines',
      path: '/fines',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Members',
      path: '/members',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Genres',
      path: '/genres',
      icon: <Tag className="w-4 h-4" />,
    },
    {
      label: 'Suggestions',
      path: '/suggestions',
      icon: <Lightbulb className="w-4 h-4" />,
    },
  ]

  // Combine links based on role
  const navLinks: NavLink[] = [
    ...commonLinks,
    ...(isMember ? memberLinks : []),
    ...(isLibrarian || isAdmin ? staffLinks : []),
  ]

  // Role badge color and label
  const roleBadge = {
    ADMIN:     { label: 'Admin',     color: 'bg-red-100 text-red-700' },
    LIBRARIAN: { label: 'Librarian', color: 'bg-blue-100 text-blue-700' },
    MEMBER:    { label: 'Member',    color: 'bg-green-100 text-green-700' },
  }

  const badge = user ? roleBadge[user.role] : null

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-xl text-blue-600"
          >
            <BookOpen className="w-6 h-6" />
            <span>LibraryMS</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg
                  text-sm font-medium transition-colors duration-150
                  ${isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — user dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                           hover:bg-gray-100 transition-colors duration-150"
              >
                {/* Avatar — show profile picture or initials */}
<div className="w-8 h-8 rounded-full bg-blue-600
                flex items-center justify-center
                overflow-hidden flex-shrink-0">
  {(user as any)?.profile_picture_url ? (
    <img
      src={(user as any).profile_picture_url}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white text-sm font-semibold">
      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
    </span>
  )}
</div>

                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white
                                rounded-xl shadow-lg border border-gray-200
                                py-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                               text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  <hr className="my-1 border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm
                               text-red-600 hover:bg-red-50 w-full text-left"
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3">
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

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                         text-sm font-medium text-red-600 hover:bg-red-50"
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