'use client'

import { useEffect } from 'react'

type Props = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">{title}</h2>
          <p className="text-sm text-[var(--text-muted)]">{description}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--bg-primary)] flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}