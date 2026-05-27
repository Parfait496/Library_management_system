import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { BookOpen } from 'lucide-react'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto
                       px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        py-6">
          <div className="flex flex-col sm:flex-row items-center
                          justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg
                              flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                LibraryMS
              </span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} LibraryMS.
              Developed by{' '}
              <span className="font-medium text-blue-600">
                Medical Student Parfait Ndizihiwe
              </span>
            </p>
            <p className="text-xs text-gray-400">
              All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout