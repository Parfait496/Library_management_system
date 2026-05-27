import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, Clock, Shield, Star,
  ArrowRight, CheckCircle, Mail, Phone,
  MapPin, ChevronDown, Menu, X
} from 'lucide-react'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  // Navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Smart Catalogue',
      desc: 'Browse thousands of books with powerful search and genre filtering.',
      color: 'bg-blue-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Member Management',
      desc: 'Track members, borrowing history, and outstanding fines effortlessly.',
      color: 'bg-green-500',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Borrow Lifecycle',
      desc: 'From request to return — every step tracked and automated.',
      color: 'bg-purple-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Role-Based Access',
      desc: 'Admin, Librarian, and Member roles with fine-grained permissions.',
      color: 'bg-orange-500',
    },
  ]

  const stats = [
    { value: '10,000+', label: 'Books Managed' },
    { value: '500+',    label: 'Active Members' },
    { value: '99.9%',   label: 'Uptime' },
    { value: '< 1s',    label: 'Response Time' },
  ]

  const testimonials = [
    {
      name: 'Dr. Amara Diallo',
      role: 'University Librarian',
      text: 'LibraryMS transformed how we manage our collection. The automated overdue system alone saves us hours every week.',
      avatar: 'AD',
      color: 'bg-blue-500',
    },
    {
      name: 'Jean-Pierre Habimana',
      role: 'Library Member',
      text: 'I can request books from my phone and get notified when approved. So convenient!',
      avatar: 'JH',
      color: 'bg-green-500',
    },
    {
      name: 'Fatima Nkurunziza',
      role: 'Head Librarian',
      text: 'The fine management and reporting features give us complete visibility into our library operations.',
      avatar: 'FN',
      color: 'bg-purple-500',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create an Account',
      desc: 'Register as a member with email verification to get started.',
    },
    {
      step: '02',
      title: 'Browse the Catalogue',
      desc: 'Search and filter thousands of books by title, author, or genre.',
    },
    {
      step: '03',
      title: 'Request a Book',
      desc: 'Submit a borrow request with one click.',
    },
    {
      step: '04',
      title: 'Pick Up & Return',
      desc: 'Get notified when approved, pick up your book, and return within 14 days.',
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white shadow-md py-3'
          : 'bg-transparent py-5'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl
                            flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl
              ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              LibraryMS
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials', 'Contact'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium transition-colors
                  ${scrolled
                    ? 'text-gray-600 hover:text-blue-600'
                    : 'text-white/80 hover:text-white'
                  }`}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-medium px-4 py-2 rounded-lg
                transition-colors
                ${scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium px-4 py-2 rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700
                         transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen
              ? <X className={scrolled ? 'text-gray-900' : 'text-white'} />
              : <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />
            }
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100
                          px-4 py-4 space-y-3">
            {['Features', 'How It Works', 'Testimonials', 'Contact'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 text-center py-2 border border-gray-300
                           rounded-lg text-gray-700 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 text-center py-2 bg-blue-600
                           rounded-lg text-white font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section className="relative min-h-screen flex items-center
                           overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br
                        from-blue-900 via-blue-800 to-indigo-900" />

        {/* Animated circles */}
        <div className="absolute top-20 right-20 w-72 h-72
                        bg-blue-500/20 rounded-full blur-3xl
                        animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96
                        bg-indigo-500/20 rounded-full blur-3xl
                        animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64
                        bg-purple-500/10 rounded-full blur-2xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6
                        lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2
                          gap-16 items-center">

            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2
                              bg-blue-500/20 border border-blue-400/30
                              rounded-full px-4 py-1.5 mb-6">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-blue-200 text-sm font-medium">
                  Modern Library Management
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold
                             text-white leading-tight mb-6">
                Manage Your
                <span className="text-transparent bg-clip-text
                                 bg-gradient-to-r from-blue-300
                                 to-cyan-300">
                  {' '}Library{' '}
                </span>
                Smarter
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed mb-8
                            max-w-lg">
                A complete library management system for institutions.
                Track books, manage members, automate borrowing — all
                in one beautiful platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2
                             px-8 py-4 bg-white text-blue-900
                             font-semibold rounded-xl hover:bg-blue-50
                             transition-all duration-200 shadow-lg
                             hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2
                             px-8 py-4 bg-white/10 text-white
                             font-semibold rounded-xl
                             hover:bg-white/20 transition-all
                             duration-200 border border-white/20"
                >
                  Sign In
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6">
                {['No credit card', 'Free forever', 'Open source'].map(badge => (
                  <div key={badge}
                       className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-blue-200 text-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards UI mockup */}
            <div className="hidden lg:block relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-sm border
                              border-white/20 rounded-2xl p-6
                              shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white/50 text-sm ml-2">
                    LibraryMS Dashboard
                  </span>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Total Books', value: '2,847', color: 'bg-blue-500' },
                    { label: 'Active Loans', value: '142', color: 'bg-green-500' },
                    { label: 'Overdue', value: '8', color: 'bg-red-500' },
                    { label: 'Members', value: '389', color: 'bg-purple-500' },
                  ].map(stat => (
                    <div key={stat.label}
                         className="bg-white/10 rounded-xl p-3">
                      <div className={`w-8 h-8 ${stat.color} rounded-lg
                                      flex items-center justify-center
                                      mb-2`}>
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-white font-bold text-lg">
                        {stat.value}
                      </p>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="space-y-2">
                  {[
                    { book: 'Clean Code', user: 'Jean M.', status: 'Borrowed', color: 'bg-blue-500' },
                    { book: 'The Alchemist', user: 'Amara K.', status: 'Returned', color: 'bg-green-500' },
                    { book: 'Atomic Habits', user: 'Diane R.', status: 'Overdue', color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i}
                         className="flex items-center justify-between
                                    bg-white/5 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {item.book}
                        </p>
                        <p className="text-white/50 text-xs">{item.user}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full
                                       ${item.color} text-white`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-6 -right-6 bg-white
                              rounded-xl shadow-xl p-3 flex items-center
                              gap-3 border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-full
                                flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 text-xs font-semibold">
                    Book Approved!
                  </p>
                  <p className="text-gray-500 text-xs">
                    Clean Code is ready
                  </p>
                </div>
              </div>

              {/* Floating user card */}
              <div className="absolute -bottom-6 -left-6 bg-white
                              rounded-xl shadow-xl p-3 flex items-center
                              gap-3 border border-gray-100">
                <div className="w-10 h-10 bg-blue-600 rounded-full
                                flex items-center justify-center
                                text-white font-bold text-sm">
                  JM
                </div>
                <div>
                  <p className="text-gray-900 text-xs font-semibold">
                    Jean M.
                  </p>
                  <p className="text-gray-500 text-xs">3 active loans</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                        flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* ================================================================
          STATS SECTION
      ================================================================ */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION
      ================================================================ */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm
                             uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Everything you need to run a library
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              From book cataloguing to fine management — LibraryMS
              covers the complete library workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`
                  p-6 rounded-2xl cursor-pointer transition-all
                  duration-300
                  ${activeFeature === i
                    ? 'bg-blue-600 text-white shadow-xl scale-105'
                    : 'bg-white text-gray-900 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center
                  justify-center mb-4
                  ${activeFeature === i
                    ? 'bg-white/20'
                    : feature.color + ' text-white'
                  }
                `}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed
                  ${activeFeature === i
                    ? 'text-blue-100'
                    : 'text-gray-500'
                  }`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Feature detail cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📧',
                title: 'Email Notifications',
                desc: 'Automatic emails for approvals, rejections, overdue reminders, and weekly book digests.',
              },
              {
                icon: '📊',
                title: 'Analytics Dashboard',
                desc: 'Real-time stats on borrowing trends, overdue rates, popular books, and member activity.',
              },
              {
                icon: '🔒',
                title: 'JWT Security',
                desc: 'Industry-standard JWT authentication with token refresh and secure logout.',
              },
              {
                icon: '📱',
                title: 'Mobile Responsive',
                desc: 'Works perfectly on phones, tablets, and desktops. Manage your library anywhere.',
              },
              {
                icon: '💡',
                title: 'Book Suggestions',
                desc: 'Members can suggest books they want the library to acquire.',
              },
              {
                icon: '💰',
                title: 'Fine Management',
                desc: 'Automatic fine calculation with librarian tools to mark paid or waive fines.',
              },
            ].map((item, i) => (
              <div key={i}
                   className="bg-white p-6 rounded-2xl shadow-sm
                              border border-gray-100 hover:shadow-md
                              transition-shadow">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm
                             uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Get started in 4 simple steps
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-0
                            right-0 h-0.5 bg-blue-100 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8
                            relative z-10">
              {howItWorks.map((step, i) => (
                <div key={i} className="flex flex-col items-center
                                        text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full
                                  flex items-center justify-center
                                  text-white font-bold text-lg mb-4
                                  shadow-lg shadow-blue-200">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4
                         bg-blue-600 text-white font-semibold
                         rounded-xl hover:bg-blue-700 transition-all
                         duration-200 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5"
            >
              Create your free account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
      ================================================================ */}
      <section id="testimonials"
               className="py-24 bg-gradient-to-br from-gray-50
                          to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm
                             uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Loved by librarians and members
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i}
                   className="bg-white p-8 rounded-2xl shadow-sm
                              border border-gray-100 hover:shadow-md
                              transition-shadow">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j}
                          className="w-4 h-4 text-yellow-400
                                     fill-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed mb-6
                              italic">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full
                                  flex items-center justify-center
                                  text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          ROLES SECTION
      ================================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for every role
            </h2>
            <p className="text-xl text-gray-500">
              Different views and tools for each user type
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                role: 'Admin',
                color: 'from-red-500 to-pink-500',
                icon: '👑',
                perms: [
                  'Full system access',
                  'Manage all users and roles',
                  'View all reports and analytics',
                  'Configure system settings',
                  'Manage genres and catalogue',
                ],
              },
              {
                role: 'Librarian',
                color: 'from-blue-500 to-indigo-500',
                icon: '📚',
                perms: [
                  'Add and edit books',
                  'Approve or reject borrow requests',
                  'Mark books as borrowed and returned',
                  'Manage fines and payments',
                  'View member borrowing history',
                ],
              },
              {
                role: 'Member',
                color: 'from-green-500 to-teal-500',
                icon: '👤',
                perms: [
                  'Browse the book catalogue',
                  'Request to borrow books',
                  'View borrowing history',
                  'Track outstanding fines',
                  'Suggest books to the library',
                ],
              },
            ].map((role, i) => (
              <div key={i}
                   className="relative overflow-hidden rounded-2xl
                              border border-gray-100 shadow-sm
                              hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className={`bg-gradient-to-r ${role.color}
                                 p-6 text-white`}>
                  <span className="text-4xl block mb-3">{role.icon}</span>
                  <h3 className="text-2xl font-bold">{role.role}</h3>
                </div>
                {/* Permissions */}
                <div className="p-6 bg-white">
                  <ul className="space-y-3">
                    {role.perms.map((perm, j) => (
                      <li key={j}
                          className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500
                                               flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">
                          {perm}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className={`mt-6 w-full py-3 rounded-xl
                               font-semibold text-sm transition-all
                               bg-gradient-to-r ${role.color}
                               text-white hover:opacity-90`}
                  >
                    Get Started as {role.role}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA SECTION
      ================================================================ */}
      <section className="py-24 bg-gradient-to-br from-blue-900
                           via-blue-800 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to modernize your library?
          </h2>
          <p className="text-xl text-blue-200 mb-10">
            Join hundreds of libraries already using LibraryMS.
            Free to use, open source, and constantly improving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4
                          justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-blue-900
                         font-bold rounded-xl hover:bg-blue-50
                         transition-all shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5"
            >
              Start for Free Today
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white/10 text-white
                         font-bold rounded-xl hover:bg-white/20
                         transition-all border border-white/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTACT SECTION
      ================================================================ */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get in touch
              </h2>
              <p className="text-gray-500 mb-8">
                Have questions or need help setting up LibraryMS
                for your institution?
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: <Mail className="w-5 h-5" />,
                    label: 'Email',
                    value: 'ndizihiwep@asome.health',
                  },
                  {
                    icon: <Phone className="w-5 h-5" />,
                    label: 'Phone',
                    value: '+250 7XX XXX XXX',
                  },
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    label: 'Location',
                    value: 'Kigali, Rwanda',
                  },
                ].map((item, i) => (
                  <div key={i}
                       className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl
                                    flex items-center justify-center
                                    text-blue-600">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {item.label}
                      </p>
                      <p className="font-medium text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm
                            border border-gray-100">
              <form className="space-y-4"
                    onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border
                                 border-gray-300 rounded-lg
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500 text-sm"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border
                                 border-gray-300 rounded-lg
                                 focus:outline-none focus:ring-2
                                 focus:ring-blue-500 text-sm"
                      placeholder="Mugisha"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium
                                    text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border
                               border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2
                               focus:ring-blue-500 text-sm"
                    placeholder="jean@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium
                                    text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border
                               border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2
                               focus:ring-blue-500 text-sm
                               resize-none"
                    placeholder="Tell us about your library..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white
                             font-semibold rounded-xl
                             hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-xl
                                flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">LibraryMS</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-xs">
                A modern library management system built for
                institutions that want to manage books, members,
                and borrowing efficiently.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: '🐙', label: 'GitHub', href: 'https://github.com/Parfait496/Library_management_system' },
                  { icon: '𝕏', label: 'Twitter', href: '#' },
                  { icon: '💼', label: 'LinkedIn', href: '#' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-lg
                               flex items-center justify-center
                               text-gray-400 hover:text-white
                               hover:bg-blue-600 transition-colors
                               text-lg"
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Sign In', href: '/login' },
                  { label: 'Register', href: '/register' },
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white
                                 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech stack */}
            <div>
              <h4 className="font-semibold text-white mb-4">
                Built With
              </h4>
              <ul className="space-y-2">
                {[
                  'Django REST Framework',
                  'React + TypeScript',
                  'Tailwind CSS',
                  'PostgreSQL',
                  'Docker',
                ].map((tech, i) => (
                  <li key={i}
                      className="text-gray-400 text-sm flex
                                 items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500
                                    rounded-full" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center
                            justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} LibraryMS.
                  All rights reserved.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Designed & developed by{' '}
                  <span className="text-blue-400 font-medium">
                    Medical Student Parfait Ndizihiwe
                  </span>
                </p>
              </div>
              <div className="flex gap-6">
                {['Privacy Policy', 'Terms of Service'].map((link, i) => (
                  <a key={i} href="#"
                     className="text-gray-500 hover:text-gray-300
                                text-xs transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Landing

export {}