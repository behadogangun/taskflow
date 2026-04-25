'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'delete'

type Toast = {
  id: string
  message: string
  type: ToastType
  leaving: boolean
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()

    setToasts(prev => [...prev, { id, message, type, leaving: false }])

    // Çıkış animasyonu başlat
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === id ? { ...t, leaving: true } : t)
      )
    }, 2700)

    // Animasyon bittikten sonra kaldır
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const colorMap: Record<ToastType, string> = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    delete: 'bg-red-500 text-white',
    info: 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: toast.leaving ? 0 : 1,
              transform: toast.leaving ? 'translateX(20px)' : 'translateX(0)',
            }}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colorMap[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}