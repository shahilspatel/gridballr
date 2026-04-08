'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

type Toast = {
  id: string
  message: string
  type: 'success' | 'info' | 'error'
}

type ToastContextType = {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-20 right-4 z-[200] flex flex-col gap-2 md:bottom-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-in slide-in-from-right border px-4 py-2.5 text-[11px] font-medium tracking-wide shadow-lg backdrop-blur-sm transition-all ${
              t.type === 'success'
                ? 'border-green/30 bg-green/10 text-green'
                : t.type === 'error'
                  ? 'border-red/30 bg-red/10 text-red'
                  : 'border-cyan/30 bg-cyan/10 text-cyan'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
