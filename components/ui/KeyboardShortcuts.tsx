'use client'

import { useState, useEffect } from 'react'

type Shortcut = {
  key: string
  description: string
}

const shortcuts: Shortcut[] = [
  { key: '?', description: 'Kısayolları göster' },
  { key: 'Ctrl + Shift + N', description: 'Yeni sütun ekle' },
  { key: 'Ctrl + Shift + B', description: 'Dashboard\'a dön' },
  { key: 'Ctrl + Shift + D', description: 'Dark/Light mode değiştir' },
  { key: 'Esc', description: 'Modalı kapat / İptal' },
  { key: 'Enter', description: 'Onayla / Kaydet' },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input veya textarea odaklanmışsa çalıştırma
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === '?') setOpen(prev => !prev)
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] text-xs font-bold"
      title="Klavye kısayolları (?)"
    >
      ?
    </button>
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Klavye Kısayolları</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)]"
          >
            ✕
          </button>
        </div>

        {/* Kısayol listesi */}
        <div className="px-6 py-4 space-y-3">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{description}</span>
              <kbd className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-xs font-mono text-[var(--text-primary)]">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Input alanlarında kısayollar devre dışıdır
          </p>
        </div>
      </div>
    </div>
  )
}