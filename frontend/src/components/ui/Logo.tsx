import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  showTagline?: boolean
  light?: boolean // use light text (for dark backgrounds like the footer/hero)
}

const SIZES = {
  sm: { badge: 32, icon: 18, word: 'text-base', tag: 'text-[8px]' },
  md: { badge: 40, icon: 22, word: 'text-lg',   tag: 'text-[9px]' },
  lg: { badge: 56, icon: 30, word: 'text-2xl',  tag: 'text-[10px]' },
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  light = false,
}) => {
  const s = SIZES[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark — navy badge, open book, oxblood bookmark ribbon */}
      <div
        className="rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ width: s.badge, height: s.badge, background: '#16333A' }}
      >
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 120 120"
          fill="none"
        >
          <path
            d="M15 30 Q60 15 105 30 L105 90 Q60 78 15 90 Z"
            stroke="#F2F4EF"
            strokeWidth="6"
          />
          <line x1="60" y1="22" x2="60" y2="83" stroke="#F2F4EF" strokeWidth="5" />
          <path
            d="M30 36 L40 36 M30 46 L44 46 M30 56 L40 56"
            stroke="#5C7A63"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M80 36 L90 36 M76 46 L90 46 M80 56 L90 56"
            stroke="#5C7A63"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M80 0 L96 0 L96 40 L88 32 L80 40 Z" fill="#7A3B32" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="leading-tight">
          <span
            className={`block font-medium italic ${s.word} ${light ? 'text-[#F2F4EF]' : 'text-[#16333A]'}`}
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            Codex
          </span>
          {showTagline && (
            <span
              className={`block ${s.tag} tracking-widest uppercase text-[#5C7A63]`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ASOME Smart Library
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default Logo