import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, BookMarked, Lightbulb,
  Clock, Shield, Users, ChevronDown,
  ArrowRight, CheckCircle, Menu, X,
  Star, Heart, Zap
} from 'lucide-react'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const t = setInterval(
      () => setActiveFeature(p => (p + 1) % features.length),
      3500
    )
    return () => clearInterval(t)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/login', { state: { searchQuery } })
  }

  const features = [
    {
      icon:  <BookOpen className="w-6 h-6" />,
      title: 'Smart Catalogue',
      desc:  'Search across thousands of medical textbooks, journals, and references instantly.',
      color: '#2E86AB',
    },
    {
      icon:  <BookMarked className="w-6 h-6" />,
      title: 'Reserve Books',
      desc:  'Request and reserve books online — no more standing in queues.',
      color: '#1B4F72',
    },
    {
      icon:  <Clock className="w-6 h-6" />,
      title: 'Track Your Loans',
      desc:  'See due dates, borrowing history, and return status in one place.',
      color: '#2E86AB',
    },
    {
      icon:  <Lightbulb className="w-6 h-6" />,
      title: 'Suggest Books',
      desc:  'Recommend titles the library should acquire for your studies.',
      color: '#C0392B',
    },
  ]

  const stats = [
    { value: '2,000+', label: 'Books Available' },
    { value: '500+',   label: 'Active Students' },
    { value: '14',     label: 'Days Borrow Period' },
    { value: '24/7',   label: 'Online Access' },
  ]

  const steps = [
    {
      label: 'Log In',
      desc:  'Use your ASOME credentials provided by the library.',
    },
    {
      label: 'Search',
      desc:  'Find textbooks by title, author, or subject area.',
    },
    {
      label: 'Reserve',
      desc:  'Submit a borrow request — get notified when approved.',
    },
    {
      label: 'Pick Up',
      desc:  'Collect your book at the library desk within 48 hours.',
    },
  ]

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#F0F7F9',
        color:      '#1a2332',
        minHeight:  '100vh',
      }}
    >

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <nav
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          zIndex:          100,
          background:      scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter:  scrolled ? 'blur(12px)' : 'none',
          borderBottom:    scrolled ? '1px solid #dce8ef' : '1px solid transparent',
          transition:      'all 0.3s ease',
          padding:         '0 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth:      '1100px',
            margin:        '0 auto',
            height:        '64px',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width:          '38px',
                height:         '38px',
                background:     'linear-gradient(135deg, #1B4F72, #2E86AB)',
                borderRadius:   '10px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily:  'Georgia, serif',
                  fontWeight:  700,
                  fontSize:    '15px',
                  color:       scrolled ? '#1B4F72' : 'white',
                  lineHeight:  1,
                  transition:  'color 0.3s',
                }}
              >
                ASOME Library
              </div>
              <div
                style={{
                  fontSize:   '10px',
                  color:      scrolled ? '#5a7a8a' : 'rgba(255,255,255,0.7)',
                  lineHeight: 1,
                  marginTop:  '2px',
                  transition: 'color 0.3s',
                }}
              >
                Smart Management System
              </div>
            </div>
          </div>

          {/* Desktop links */}
          <div
            style={{
              display:    'flex',
              gap:        '2rem',
              alignItems: 'center',
            }}
            className="hide-mobile"
          >
            {['Features', 'How It Works', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                style={{
                  fontSize:       '14px',
                  fontWeight:     500,
                  color:          scrolled ? '#3a5a6a' : 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  transition:     'color 0.2s',
                }}
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              style={{
                background:   '#C0392B',
                color:        'white',
                border:       'none',
                borderRadius: '8px',
                padding:      '8px 20px',
                fontSize:     '14px',
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              Library Login
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      scrolled ? '#1B4F72' : 'white',
              padding:    '4px',
            }}
            className="show-mobile"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              background:   'white',
              borderTop:    '1px solid #dce8ef',
              padding:      '1rem 1.5rem',
            }}
          >
            {['Features', 'How It Works', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display:        'block',
                  padding:        '10px 0',
                  fontSize:       '15px',
                  color:          '#1B4F72',
                  textDecoration: 'none',
                  borderBottom:   '1px solid #f0f4f6',
                }}
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              style={{
                display:      'block',
                width:        '100%',
                marginTop:    '12px',
                background:   '#C0392B',
                color:        'white',
                border:       'none',
                borderRadius: '8px',
                padding:      '12px',
                fontSize:     '15px',
                fontWeight:   600,
                cursor:       'pointer',
                textAlign:    'center',
              }}
            >
              Student Login
            </button>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section
        ref={heroRef}
        style={{
          background:    'linear-gradient(160deg, #0d2d45 0%, #1B4F72 45%, #2E86AB 100%)',
          minHeight:     '100vh',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent:'center',
          padding:       '100px 1.5rem 60px',
          position:      'relative',
          overflow:      'hidden',
        }}
      >
        {/* Background pattern — subtle grid */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents:  'none',
          }}
        />

        {/* Decorative circles */}
        <div
          style={{
            position:     'absolute',
            top:          '-100px',
            right:        '-100px',
            width:        '400px',
            height:       '400px',
            borderRadius: '50%',
            background:   'rgba(168, 213, 226, 0.08)',
            pointerEvents:'none',
          }}
        />
        <div
          style={{
            position:     'absolute',
            bottom:       '-80px',
            left:         '-80px',
            width:        '300px',
            height:       '300px',
            borderRadius: '50%',
            background:   'rgba(192, 57, 43, 0.08)',
            pointerEvents:'none',
          }}
        />

        <div
          style={{
            maxWidth:  '800px',
            width:     '100%',
            position:  'relative',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '8px',
              background:     'rgba(255,255,255,0.1)',
              border:         '1px solid rgba(255,255,255,0.2)',
              borderRadius:   '100px',
              padding:        '6px 16px',
              marginBottom:   '28px',
              fontSize:       '13px',
              color:          'rgba(255,255,255,0.9)',
            }}
          >
            <div
              style={{
                width:        '6px',
                height:       '6px',
                borderRadius: '50%',
                background:   '#A8D5E2',
              }}
            />
            Adventist School of Medicine of East Central Africa
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily:   'Georgia, serif',
              fontSize:     'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight:   700,
              color:        'white',
              lineHeight:   1.15,
              margin:       '0 0 20px',
              letterSpacing:'-0.02em',
            }}
          >
            Your Medical Library,{' '}
            <span
              style={{
                color:          '#A8D5E2',
                fontStyle:      'italic',
              }}
            >
              Digitized
            </span>
          </h1>

          <p
            style={{
              fontSize:    'clamp(16px, 2.5vw, 19px)',
              color:       'rgba(255,255,255,0.75)',
              lineHeight:  1.6,
              maxWidth:    '560px',
              margin:      '0 auto 40px',
            }}
          >
            Search, reserve, and track medical textbooks and journals
            from anywhere on campus. Built for ASOME students and staff.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display:       'flex',
              background:    'white',
              borderRadius:  '14px',
              overflow:      'hidden',
              boxShadow:     '0 20px 60px rgba(0,0,0,0.25)',
              marginBottom:  '24px',
              maxWidth:      '600px',
              margin:        '0 auto 32px',
            }}
          >
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                padding:    '0 16px',
                color:      '#8aabba',
              }}
            >
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex:       1,
                border:     'none',
                outline:    'none',
                fontSize:   '15px',
                color:      '#1a2332',
                padding:    '16px 8px',
                background: 'transparent',
              }}
            />
            <button
              type="submit"
              style={{
                background:   '#1B4F72',
                color:        'white',
                border:       'none',
                padding:      '14px 28px',
                fontSize:     '14px',
                fontWeight:   600,
                cursor:       'pointer',
                whiteSpace:   'nowrap',
              }}
            >
              Search
            </button>
          </form>

          {/* CTA buttons */}
          <div
            style={{
              display:        'flex',
              gap:            '12px',
              justifyContent: 'center',
              flexWrap:       'wrap',
            }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                background:   'white',
                color:        '#1B4F72',
                border:       'none',
                borderRadius: '10px',
                padding:      '12px 24px',
                fontSize:     '14px',
                fontWeight:   700,
                cursor:       'pointer',
                boxShadow:    '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              <BookMarked size={16} />
              Reserve a Book
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                background:   'rgba(255,255,255,0.12)',
                color:        'white',
                border:       '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px',
                padding:      '12px 24px',
                fontSize:     '14px',
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              <Lightbulb size={16} />
              Suggest a Book
            </button>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              marginTop:      '60px',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '6px',
              color:          'rgba(255,255,255,0.4)',
              fontSize:       '12px',
            }}
          >
            <span>Scroll to explore</span>
            <ChevronDown size={16} style={{ animation: 'bounce 2s infinite' }} />
          </div>
        </div>

        {/* Dashboard preview card */}
        <div
          style={{
            marginTop:    '60px',
            maxWidth:     '900px',
            width:        '100%',
            background:   'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border:       '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding:      '24px',
            position:     'relative',
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           '8px',
              marginBottom:  '20px',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
            <span
              style={{
                marginLeft:  '8px',
                fontSize:    '12px',
                color:       'rgba(255,255,255,0.5)',
              }}
            >
              ASOME Library Dashboard
            </span>
          </div>

          {/* Mini dashboard */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap:                 '12px',
              marginBottom:        '16px',
            }}
          >
            {[
              { label: 'Books Available', value: '2,847', color: '#2E86AB' },
              { label: 'My Active Loans',  value: '3',     color: '#1B4F72' },
              { label: 'Due This Week',    value: '1',     color: '#C0392B' },
              { label: 'My Requests',      value: '2',     color: '#27ae60' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background:   'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding:      '14px',
                }}
              >
                <div
                  style={{
                    fontSize:    '22px',
                    fontWeight:  700,
                    color:       stat.color === '#C0392B' ? '#ff6b6b' : 'white',
                    lineHeight:  1,
                    marginBottom:'4px',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color:    'rgba(255,255,255,0.55)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Recent activity rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { book: "Gray's Anatomy", status: 'Borrowed',  color: '#2E86AB',  due: 'Due in 5 days' },
              { book: 'Harrison\'s Principles', status: 'Approved', color: '#27ae60', due: 'Ready for pickup' },
              { book: 'Robbins Pathology',      status: 'Requested', color: '#f39c12', due: 'Pending review' },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  background:     'rgba(255,255,255,0.05)',
                  borderRadius:   '8px',
                  padding:        '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
                    {row.book}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                    {row.due}
                  </span>
                  <span
                    style={{
                      fontSize:     '11px',
                      fontWeight:   600,
                      color:        row.color,
                      background:   `${row.color}22`,
                      padding:      '3px 8px',
                      borderRadius: '100px',
                    }}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ================================================================
          STATS STRIP
      ================================================================ */}
      <section
        style={{
          background: '#1B4F72',
          padding:    '32px 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth:            '900px',
            margin:              '0 auto',
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap:                 '24px',
            textAlign:           'center',
          }}
        >
          {stats.map(stat => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily:  'Georgia, serif',
                  fontSize:    '2rem',
                  fontWeight:  700,
                  color:       '#A8D5E2',
                  lineHeight:  1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize:   '13px',
                  color:      'rgba(255,255,255,0.6)',
                  marginTop:  '4px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION
      ================================================================ */}
      <section
        id="features"
        style={{
          padding:   '80px 1.5rem',
          background:'#F0F7F9',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div
              style={{
                display:      'inline-block',
                background:   '#dceef5',
                color:        '#1B4F72',
                fontSize:     '12px',
                fontWeight:   700,
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                padding:      '5px 14px',
                borderRadius: '100px',
                marginBottom: '16px',
              }}
            >
              Built for Medical Students
            </div>
            <h2
              style={{
                fontFamily:   'Georgia, serif',
                fontSize:     'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight:   700,
                color:        '#0d2d45',
                margin:       '0 0 14px',
              }}
            >
              Everything you need to study smarter
            </h2>
            <p
              style={{
                fontSize:  '16px',
                color:     '#5a7a8a',
                maxWidth:  '500px',
                margin:    '0 auto',
                lineHeight:1.6,
              }}
            >
              From Gray's Anatomy to Harrison's Principles —
              find, reserve, and return books without spendign your time.
            </p>
          </div>

          {/* Feature cards */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap:                 '16px',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => setActiveFeature(i)}
                style={{
                  background:    activeFeature === i ? '#1B4F72' : 'white',
                  borderRadius:  '16px',
                  padding:       '24px',
                  cursor:        'pointer',
                  transition:    'all 0.3s ease',
                  border:        `2px solid ${activeFeature === i ? '#1B4F72' : '#e4eef3'}`,
                  transform:     activeFeature === i ? 'translateY(-4px)' : 'none',
                  boxShadow:     activeFeature === i
                    ? '0 12px 40px rgba(27,79,114,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width:          '44px',
                    height:         '44px',
                    borderRadius:   '12px',
                    background:     activeFeature === i
                      ? 'rgba(255,255,255,0.15)'
                      : '#dceef5',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    marginBottom:   '16px',
                    color:          activeFeature === i ? 'white' : f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize:    '16px',
                    fontWeight:  700,
                    color:       activeFeature === i ? 'white' : '#0d2d45',
                    margin:      '0 0 8px',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize:  '14px',
                    color:     activeFeature === i
                      ? 'rgba(255,255,255,0.75)'
                      : '#6a8a9a',
                    lineHeight:1.5,
                    margin:    0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Extra capability pills */}
          <div
            style={{
              display:        'flex',
              flexWrap:       'wrap',
              gap:            '10px',
              justifyContent: 'center',
              marginTop:      '36px',
            }}
          >
            {[
              '📚 Medical Textbooks',
              '📰 Journals & Periodicals',
              '💰 Fine Tracking',
              '📊 Borrowing History',
              
              
            ].map(pill => (
              <span
                key={pill}
                style={{
                  background:   'white',
                  border:       '1px solid #d0e5ef',
                  borderRadius: '100px',
                  padding:      '7px 16px',
                  fontSize:     '13px',
                  color:        '#2E86AB',
                  fontWeight:   500,
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section
        id="how-it-works"
        style={{
          background: 'white',
          padding:    '80px 1.5rem',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div
              style={{
                display:      'inline-block',
                background:   '#fde8e6',
                color:        '#C0392B',
                fontSize:     '12px',
                fontWeight:   700,
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                padding:      '5px 14px',
                borderRadius: '100px',
                marginBottom: '16px',
              }}
            >
              Simple Process
            </div>
            <h2
              style={{
                fontFamily:  'Georgia, serif',
                fontSize:    'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight:  700,
                color:       '#0d2d45',
                margin:      '0 0 14px',
              }}
            >
              Borrow a book in four steps
            </h2>
          </div>

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap:                 '24px',
              position:            'relative',
            }}
          >
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width:          '52px',
                    height:         '52px',
                    borderRadius:   '50%',
                    background:     'linear-gradient(135deg, #1B4F72, #2E86AB)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    margin:         '0 auto 16px',
                    boxShadow:      '0 6px 20px rgba(27,79,114,0.3)',
                  }}
                >
                  <span
                    style={{
                      color:      'white',
                      fontWeight: 700,
                      fontSize:   '16px',
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize:   '16px',
                    fontWeight: 700,
                    color:      '#0d2d45',
                    margin:     '0 0 8px',
                  }}
                >
                  {step.label}
                </h3>
                <p
                  style={{
                    fontSize:  '14px',
                    color:     '#6a8a9a',
                    lineHeight:1.5,
                    margin:    0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '8px',
                background:   'linear-gradient(135deg, #1B4F72, #2E86AB)',
                color:        'white',
                border:       'none',
                borderRadius: '12px',
                padding:      '14px 32px',
                fontSize:     '15px',
                fontWeight:   700,
                cursor:       'pointer',
                boxShadow:    '0 8px 24px rgba(27,79,114,0.3)',
              }}
            >
              Access the Library
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          ABOUT SECTION
      ================================================================ */}
      <section
        id="about"
        style={{
          background: '#F0F7F9',
          padding:    '80px 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth:            '900px',
            margin:              '0 auto',
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '48px',
            alignItems:          'center',
          }}
        >
          <div>
            <div
              style={{
                display:      'inline-block',
                background:   '#dceef5',
                color:        '#1B4F72',
                fontSize:     '12px',
                fontWeight:   700,
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                padding:      '5px 14px',
                borderRadius: '100px',
                marginBottom: '20px',
              }}
            >
              About ASOME
            </div>
            <h2
              style={{
                fontFamily:  'Georgia, serif',
                fontSize:    'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight:  700,
                color:       '#0d2d45',
                margin:      '0 0 16px',
                lineHeight:  1.2,
              }}
            >
              Serving the future healers of East Central Africa
            </h2>
            <p
              style={{
                fontSize:  '15px',
                color:     '#5a7a8a',
                lineHeight:1.7,
                margin:    '0 0 24px',
              }}
            >
              The Adventist School of Medicine of East Central Africa
              is committed to training compassionate, competent
              healthcare professionals. Our library system ensures
              every student has equal access to the knowledge they
              need to serve their communities.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Equal access to medical knowledge for all students',
                'Supporting evidence-based medical education',
                'Efficient resource management for library staff',
                'Built with ASOME\'s academic mission in mind',
              ].map((point, i) => (
                <div
                  key={i}
                  style={{
                    display:    'flex',
                    alignItems: 'flex-start',
                    gap:        '10px',
                  }}
                >
                  <CheckCircle size={16} color="#2E86AB" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', color: '#4a6a7a', lineHeight: 1.5 }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Role cards */}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { emoji: '🔍', text: 'Search thousands of medical books and journals' },
              { emoji: '📖', text: 'Reserve books online and pick them up at the desk' },
              { emoji: '📅', text: 'Track your loans, due dates, and return status' },
              { emoji: '💡', text: 'Suggest new books for the library to acquire' },
              { emoji: '💰', text: 'View and track any outstanding fines' },
              { emoji: '📚', text: 'Access Gray\'s Anatomy, Harrison\'s, Robbins, and more' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '14px',
                  background: 'white',
                  borderRadius: '12px',
                  padding:    '14px 18px',
                  border:     '1px solid #e4eef3',
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.emoji}</span>
                <span style={{ fontSize: '14px', color: '#3a5a6a', lineHeight: 1.4 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
      ================================================================ */}
      <section
        style={{
          background:    'linear-gradient(135deg, #0d2d45 0%, #1B4F72 100%)',
          padding:       '80px 1.5rem',
          textAlign:     'center',
          position:      'relative',
          overflow:      'hidden',
        }}
      >
        <div
          style={{
            position:     'absolute',
            top:          '-60px',
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        '400px',
            height:       '400px',
            borderRadius: '50%',
            background:   'rgba(168,213,226,0.05)',
            pointerEvents:'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
          <h2
            style={{
              fontFamily:  'Georgia, serif',
              fontSize:    'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight:  700,
              color:       'white',
              margin:      '0 0 16px',
            }}
          >
            Ready to access your library?
          </h2>
          <p
            style={{
              fontSize:   '16px',
              color:      'rgba(255,255,255,0.65)',
              margin:     '0 0 36px',
              lineHeight: 1.6,
            }}
          >
            Log in with your ASOME credentials and start finding
            the books you need for your studies today.
          </p>
          <div
            style={{
              display:        'flex',
              gap:            '12px',
              justifyContent: 'center',
              flexWrap:       'wrap',
            }}
          >
            <button
              onClick={() => navigate('/login')}
              style={{
                background:   'white',
                color:        '#1B4F72',
                border:       'none',
                borderRadius: '12px',
                padding:      '14px 36px',
                fontSize:     '15px',
                fontWeight:   700,
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                boxShadow:    '0 8px 30px rgba(0,0,0,0.2)',
              }}
            >
              <BookOpen size={16} />
              Library Login
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer
        style={{
          background:  '#0d2d45',
          padding:     '40px 1.5rem',
          color:       'rgba(255,255,255,0.5)',
        }}
      >
        <div
          style={{
            maxWidth:       '900px',
            margin:         '0 auto',
            display:        'flex',
            flexDirection:  'column',
            gap:            '24px',
          }}
        >
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'flex-start',
              flexWrap:       'wrap',
              gap:            '24px',
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '10px',
                  marginBottom:'12px',
                }}
              >
                <div
                  style={{
                    width:          '32px',
                    height:         '32px',
                    background:     'linear-gradient(135deg, #1B4F72, #2E86AB)',
                    borderRadius:   '8px',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={16} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontWeight: 700,
                      color:      'white',
                      fontSize:   '14px',
                    }}
                  >
                    ASOME Library
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    Smart Management System
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '260px' }}>
                Adventist School of Medicine of East Central Africa.
                Empowering students with knowledge.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div>
                <div
                  style={{
                    color:         'rgba(255,255,255,0.8)',
                    fontSize:      '13px',
                    fontWeight:    600,
                    marginBottom:  '12px',
                  }}
                >
                  Quick Access
                </div>
                {[
                  { label: 'Library Login', path: '/login' },
                  { label: 'Book Catalogue', path: '/login' },
                  { label: 'My Borrows', path: '/login' },
                  { label: 'Suggest a Book', path: '/login' },
                ].map((link, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <span
                      onClick={() => navigate(link.path)}
                      style={{
                        fontSize:  '13px',
                        cursor:    'pointer',
                        color:     'rgba(255,255,255,0.5)',
                      }}
                    >
                      {link.label}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    color:        'rgba(255,255,255,0.8)',
                    fontSize:     '13px',
                    fontWeight:   600,
                    marginBottom: '12px',
                  }}
                >
                  Contact
                </div>
                {[
                  'library@asome.ac',
                  'Kigali, Rwanda',
                  '+250 7XX XXX XXX',
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize:     '13px',
                      marginBottom: '8px',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop:   '1px solid rgba(255,255,255,0.08)',
              paddingTop:  '20px',
              display:     'flex',
              justifyContent:'space-between',
              flexWrap:    'wrap',
              gap:         '8px',
            }}
          >
            <span style={{ fontSize: '12px' }}>
              © {new Date().getFullYear()} ASOME Library Management System.
              All rights reserved.
            </span>
            <span style={{ fontSize: '12px' }}>
              Developed by{' '}
              <span style={{ color: '#A8D5E2', fontWeight: 600 }}>
                Medical Student Parfait Ndizihiwe
              </span>
            </span>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        .hide-mobile { display: flex; }
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

    </div>
  )
}

export default Landing