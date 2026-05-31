import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, Users, Clock, Shield,
  ArrowRight, CheckCircle, ChevronDown,
  Mail, MapPin, Github, ArrowLeft,
} from 'lucide-react'

const Landing: React.FC = () => {
  const navigate   = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Smart Book Catalogue',
      desc: 'Search and filter thousands of books by title, author, or genre instantly.',
      color: 'bg-blue-500',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Member Management',
      desc: 'Track members, borrowing history, and outstanding fines effortlessly.',
      color: 'bg-green-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Borrow Lifecycle',
      desc: 'From request to return — every step tracked and automated.',
      color: 'bg-purple-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role-Based Access',
      desc: 'Admin, Librarian, and Member roles with the right permissions.',
      color: 'bg-orange-500',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create Account',
      desc: 'Register and verify your email to get started as a member.',
    },
    {
      step: '02',
      title: 'Browse Books',
      desc: 'Search and filter our catalogue to find books you want.',
    },
    {
      step: '03',
      title: 'Request & Borrow',
      desc: 'Submit a borrow request and pick up your book once approved.',
    },
    {
      step: '04',
      title: 'Return on Time',
      desc: 'Return within 14 days to avoid fines of 100 RWF per day.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}
      `}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6
                        flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg
                            flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg
              ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              LibraryMS
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How It Works', 'Contact'].map(link => (
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

          {/* Auth buttons */}
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
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden font-medium text-sm px-3 py-1.5
                        rounded-lg border transition-colors
              ${scrolled
                ? 'border-gray-300 text-gray-700'
                : 'border-white/30 text-white'
              }`}
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100
                          px-4 py-4 space-y-3">
            {['Features', 'How It Works', 'Contact'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="block text-gray-700 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2 border border-gray-300
                           rounded-lg text-gray-700 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 py-2 bg-blue-600 rounded-lg
                           text-white text-sm font-medium"
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
                           bg-gradient-to-br from-blue-900
                           via-blue-800 to-indigo-900 overflow-hidden">

        {/* Background circles */}
        <div className="absolute top-20 right-20 w-80 h-80
                        bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96
                        bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6
                        py-32 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2
                          bg-white/10 border border-white/20
                          rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full
                             animate-pulse" />
            <span className="text-white/80 text-sm">
              Now live — try it free
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold
                         text-white leading-tight mb-6">
            Manage Your Library
            <span className="block text-transparent bg-clip-text
                             bg-gradient-to-r from-blue-300
                             to-cyan-300">
              Smarter
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            A complete digital library system for tracking books,
            members, borrowing, and fines — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4
                          justify-center mb-16">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2
                         px-8 py-4 bg-white text-blue-900
                         font-semibold rounded-xl hover:bg-blue-50
                         transition-all shadow-lg hover:-translate-y-0.5"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2
                         px-8 py-4 bg-white/10 text-white
                         font-semibold rounded-xl hover:bg-white/20
                         transition-all border border-white/20"
            >
              Sign In
            </button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center
                          gap-6">
            {[
              'Free to use',
              'No credit card',
              'Email verified',
              'Secure JWT auth',
            ].map(point => (
              <div key={point}
                   className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-blue-200 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                        flex flex-col items-center gap-1 text-white/40">
          <span className="text-xs">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION
      ================================================================ */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm
                             uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold
                           text-gray-900 mt-2 mb-4">
              Everything a library needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From cataloguing books to tracking overdue fines —
              LibraryMS handles the complete library workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i}
                   className="bg-white p-6 rounded-2xl border
                              border-gray-100 shadow-sm
                              hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${feature.color}
                                 rounded-xl flex items-center
                                 justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Extra feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              '📧 Email Notifications',
              '💰 Fine Management',
              '📱 Mobile Responsive',
              '💡 Book Suggestions',
              '🔒 JWT Security',
              '👥 3 User Roles',
            ].map(item => (
              <span key={item}
                    className="px-4 py-2 bg-white border
                               border-gray-200 rounded-full text-sm
                               text-gray-700 shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm
                             uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold
                           text-gray-900 mt-2 mb-4">
              4 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl
                                flex items-center justify-center
                                text-white font-bold text-xl
                                mx-auto mb-4 shadow-lg
                                shadow-blue-200">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4
                         bg-blue-600 text-white font-semibold
                         rounded-xl hover:bg-blue-700 transition-all
                         shadow-lg hover:-translate-y-0.5"
            >
              Create your free account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          ROLES SECTION
      ================================================================ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold
                           text-gray-900 mb-4">
              Built for every role
            </h2>
            <p className="text-gray-500">
              Different tools and views for each type of user
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role:  'Admin',
                emoji: '👑',
                color: 'from-red-500 to-pink-500',
                perms: [
                  'Full system access',
                  'Manage all users and roles',
                  'View all reports',
                  'Manage genres and catalogue',
                ],
              },
              {
                role:  'Librarian',
                emoji: '📚',
                color: 'from-blue-500 to-indigo-500',
                perms: [
                  'Add and edit books',
                  'Approve or reject requests',
                  'Mark books borrowed/returned',
                  'Manage fines and payments',
                ],
              },
              {
                role:  'Member',
                emoji: '👤',
                color: 'from-green-500 to-teal-500',
                perms: [
                  'Browse book catalogue',
                  'Request to borrow books',
                  'View borrowing history',
                  'Suggest books to library',
                ],
              },
            ].map((role, i) => (
              <div key={i}
                   className="bg-white rounded-2xl overflow-hidden
                              border border-gray-100 shadow-sm
                              hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-r ${role.color}
                                 p-6 text-white`}>
                  <span className="text-4xl block mb-2">
                    {role.emoji}
                  </span>
                  <h3 className="text-xl font-bold">{role.role}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {role.perms.map((perm, j) => (
                      <li key={j}
                          className="flex items-start gap-2 text-sm
                                     text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500
                                               flex-shrink-0 mt-0.5" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className={`mt-5 w-full py-2.5 rounded-xl
                               text-sm font-semibold text-white
                               bg-gradient-to-r ${role.color}
                               hover:opacity-90 transition-opacity`}
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
      <section className="py-20 bg-gradient-to-br from-blue-900
                           via-blue-800 to-indigo-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold
                         text-white mb-4">
            Ready to modernize your library?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Free to use. Takes 2 minutes to set up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4
                          justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-blue-900
                         font-bold rounded-xl hover:bg-blue-50
                         transition-all shadow-lg
                         hover:-translate-y-0.5"
            >
              Start for Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 text-white
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
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-500">
              Have questions? We would love to hear from you.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: <Mail className="w-5 h-5" />,
                  label: 'Email',
                  value: 'ndizihiwep@asome.health',
                },
                {
                  icon: <MapPin className="w-5 h-5" />,
                  label: 'Location',
                  value: 'Kigali, Rwanda',
                },
              ].map((item, i) => (
                <div key={i}
                     className="flex items-center gap-4 p-4
                                bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl
                                  flex items-center justify-center
                                  text-blue-600 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3
                          gap-8 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg
                                flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">LibraryMS</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A modern library management system for institutions
                that want to manage books and members digitally.
              </p>
              <a
                href="https://github.com/Parfait496/Library_management_system"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4
                           text-gray-400 hover:text-white
                           text-sm transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Features',     href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Contact',      href: '#contact' },
                  { label: 'Sign In',      href: '/login' },
                  { label: 'Register',     href: '/register' },
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
              <h4 className="font-semibold mb-4">Built With</h4>
              <ul className="space-y-2">
                {[
                  'Django REST Framework',
                  'React + TypeScript',
                  'Tailwind CSS',
                  'PostgreSQL',
                  'Docker',
                  'Railway + Netlify',
                ].map((tech, i) => (
                  <li key={i}
                      className="flex items-center gap-2 text-sm
                                 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500
                                    rounded-full flex-shrink-0" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8
                          flex flex-col sm:flex-row items-center
                          justify-between gap-4">
            <div>
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
            <a
              href="https://github.com/Parfait496/Library_management_system"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500
                         hover:text-white transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default Landing