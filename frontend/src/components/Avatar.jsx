import React from 'react'

const COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500',
  'bg-amber-500',   'bg-rose-500', 'bg-cyan-500',
  'bg-orange-500',  'bg-pink-500',
]

export default function Avatar({ name = '', size = 8, className = '' }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const color    = COLORS[(name.charCodeAt(0) || 0) % COLORS.length]
  const sizeMap  = { 6: 'w-6 h-6 text-xs', 7: 'w-7 h-7 text-xs', 8: 'w-8 h-8 text-xs', 9: 'w-9 h-9 text-sm', 10: 'w-10 h-10 text-sm', 12: 'w-12 h-12 text-base' }
  return (
    <div className={`${sizeMap[size] || 'w-8 h-8 text-xs'} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials || '?'}
    </div>
  )
}
