import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
}) => {
  const colorClasses = {
    blue:   'bg-blue-600',
    green:  'bg-green-600',
    yellow: 'bg-yellow-500',
    red:    'bg-red-600',
    purple: 'bg-purple-600',
    gray:   'bg-gray-600',
  }

  return (
    <div
      className={`
        card flex items-center gap-4
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={onClick}
    >
      {/* Icon circle */}
      <div className={`
        ${colorClasses[color]}
        p-3 rounded-xl text-white flex-shrink-0
      `}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default StatCard