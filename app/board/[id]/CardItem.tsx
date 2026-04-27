'use client'

import { useState } from 'react'
import { Card, Priority } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardModal from '@/components/board/CardModal'
import PriorityBadge from '@/components/ui/PriorityBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'

const LABELS = [
  { id: 'bug', text: 'Bug', color: 'bg-red-500' },
  { id: 'feature', text: 'Feature', color: 'bg-blue-500' },
  { id: 'design', text: 'Design', color: 'bg-purple-500' },
  { id: 'backend', text: 'Backend', color: 'bg-yellow-500' },
  { id: 'frontend', text: 'Frontend', color: 'bg-green-500' },
  { id: 'urgent', text: 'Urgent', color: 'bg-orange-500' },
]
type Props = {
  card: Card
  columnId: string
  onDelete: (cardId: string, columnId: string) => void
  onUpdate: (cardId: string, columnId: string, title: string, description: string, priority: Priority, dueDate: string | null, assignee: string | null, labels: string[]) => void
  onToggleComplete: (cardId: string, columnId: string, completed: boolean, completedBy: string) => void
}

export default function CardItem({ card, columnId, onDelete, onUpdate, onToggleComplete }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const formatDueDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const isOverdue = d < now
    return {
      text: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      isOverdue,
    }
  }

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const completedBy = profile?.full_name || profile?.email || user.email || 'Bilinmiyor'
    onToggleComplete(card.id, columnId, !card.completed, completedBy)
  }

  return (
    <>
      <div
  ref={setNodeRef}
  style={style}
  className={`bg-[var(--bg-card)] rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group border ${
    card.completed
      ? 'border-2 border-green-400'
      : 'border-[var(--border)]'
  }`}
        {...attributes}
        {...listeners}
      >
        {/* Üst satır: öncelik flag + aksiyonlar */}
        <div className="flex items-center justify-between mb-2">
          <PriorityBadge priority={card.priority} />
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true) }}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-xs px-1"
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Kartı düzenle"
            >
              ✎
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors text-xs px-1"
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Kartı sil"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Kart başlığı + tamamlama butonu */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleComplete}
            onPointerDown={(e) => e.stopPropagation()}
            className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
              opacity-0 group-hover:opacity-100
              ${card.completed
                ? 'bg-green-500 border-green-500 opacity-100'
                : 'border-[var(--border)] hover:border-green-500'
              }`}
            aria-label="Tamamlandı olarak işaretle"
          >
            {card.completed && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <p className={`text-sm font-medium leading-snug transition-all duration-200 ${
            card.completed
              ? 'line-through text-[var(--text-muted)]'
              : 'text-[var(--text-primary)] group-hover:translate-x-0.5'
          }`}>
            {card.title}
          </p>
        </div>
             
        {/* Tamamlayan kişi */}
        {card.completed && card.completed_by && (
          <div className="mt-1.5 ml-6 flex items-center gap-1">
            <span className="text-xs text-green-500">✓</span>
            <span className="text-xs text-[var(--text-muted)]">{card.completed_by} tamamladı</span>
          </div>
        )}

        {/* Açıklama */}
        {card.description && !card.completed && (
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 ml-6">
            {card.description}
          </p>
        )}

        {/* Alt bilgiler */}
        {!card.completed && (
          <div className="mt-2 flex items-center gap-2 flex-wrap ml-6">
            {card.due_date && (() => {
              const { text, isOverdue } = formatDueDate(card.due_date)
              return (
                <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  isOverdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-[var(--border)] text-[var(--text-muted)]'
                }`}>
                  📅 {text}
                </div>
              )
            })()}

            {card.assignee && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {card.assignee.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-[var(--text-muted)] truncate">{card.assignee}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Etiketler */}
{card.labels && card.labels.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-1 ml-6">
    {card.labels.map(labelId => {
      const label = LABELS.find(l => l.id === labelId)
      if (!label) return null
      return (
        <span
          key={labelId}
          className={`${label.color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
        >
          {label.text}
        </span>
      )
    })}
  </div>
)}

      {modalOpen && (
        <CardModal
          card={card}
          columnId={columnId}
          onClose={() => setModalOpen(false)}
          onSave={onUpdate}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Kartı Sil"
          description={`"${card.title}" kartını silmek istediğinize emin misiniz?`}
          onConfirm={() => {
            onDelete(card.id, columnId)
            setConfirmDelete(false)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}