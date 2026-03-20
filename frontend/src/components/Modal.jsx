import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-panel ${sizes[size]}`}>
        <div className="modal-header">
          <h3 className="font-heading font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn-icon p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
