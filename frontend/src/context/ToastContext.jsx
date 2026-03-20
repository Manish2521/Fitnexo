import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  const icons = { success: <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" />, error: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />, info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" /> }
  const borders = { success: 'border-l-4 border-primary-500', error: 'border-l-4 border-red-500', info: 'border-l-4 border-blue-500' }

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${borders[t.type]}`}>
            {icons[t.type]}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-white/50 hover:text-white ml-1"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
