'use client'

import { useState, useEffect } from 'react'
import { Card, Priority } from '@/types'
import PriorityBadge from '@/components/ui/PriorityBadge'
import Checklist from '@/components/board/Checklist'
import Comments from '@/components/board/Comments'

type Props = {
  card: Card
  onClose: () => void
  onSave: (cardId: string, columnId: string, title: string, description: string, priority: Priority, dueDate: string | null, assignee: string | null, labels: string[]) => void
  columnId: string
}

const priorities: Priority[] = ['low', 'medium', 'high']

export default function CardModal({ card, onClose, onSave, columnId }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [priority, setPriority] = useState<Priority>(card.priority)
  const [dueDate, setDueDate] = useState(card.due_date || '')
  const [assignee, setAssignee] = useState(card.assignee || '')
  const [labels, setLabels] = useState<string[]>(card.labels || [])

  const LABELS = [
  { id: 'bug', text: 'Bug', color: 'bg-red-500' },
  { id: 'feature', text: 'Feature', color: 'bg-blue-500' },
  { id: 'design', text: 'Design', color: 'bg-purple-500' },
  { id: 'backend', text: 'Backend', color: 'bg-yellow-500' },
  { id: 'frontend', text: 'Frontend', color: 'bg-green-500' },
  { id: 'urgent', text: 'Urgent', color: 'bg-orange-500' },
]

  // ESC tuşuyla kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSave = () => {
  if (!title.trim()) return
  onSave(card.id, columnId, title.trim(), description.trim(), priority, dueDate || null, assignee.trim() || null, labels)
  onClose()
}

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border)] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Kart Detayı</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)]"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Başlık */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Başlık
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu kart hakkında daha fazla bilgi ekle..."
              rows={4}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Öncelik */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Öncelik
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                    priority === p
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <PriorityBadge priority={p} size="md" />
                </button>
              ))}
            </div>
          </div>
                {/* Etiketler */}
<div>
  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
    Etiketler
  </label>
  <div className="flex flex-wrap gap-2">
    {LABELS.map(label => (
      <button
        key={label.id}
        onClick={() => setLabels(prev =>
          prev.includes(label.id)
            ? prev.filter(l => l !== label.id)
            : [...prev, label.id]
        )}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${
          labels.includes(label.id)
            ? `${label.color} text-white border-transparent`
            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
        }`}
      >
        {labels.includes(label.id) && <span>✓</span>}
        {label.text}
      </button>
    ))}
  </div>
</div>
          {/* Son Teslim Tarihi */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Son Teslim Tarihi
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Atanan Kişi */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Atanan Kişi
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="İsim veya email..."
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Alt Görevler */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Alt Görevler
            </label>
            <div className="bg-[var(--bg-primary)] rounded-xl p-3 border border-[var(--border)]">
              <Checklist cardId={card.id} />
            </div>
          </div>

          {/* Yorumlar */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Yorumlar
            </label>
            <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)]">
              <Comments cardId={card.id} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}