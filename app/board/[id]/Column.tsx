'use client'

import { useState } from 'react'
import { ColumnWithCards, Priority } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import CardItem from './CardItem'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

type Props = {
  column: ColumnWithCards
  onAddCard: (columnId: string, title: string) => void
  onDeleteColumn: (columnId: string) => void
  onDeleteCard: (cardId: string, columnId: string) => void
  onUpdateCard: (cardId: string, columnId: string, title: string, description: string, priority: Priority, dueDate: string | null, assignee: string | null, labels: string[]) => void
  onUpdateColumnTitle: (columnId: string, title: string) => void
  onToggleComplete: (cardId: string, columnId: string, completed: boolean, completedBy: string) => void
}

export default function ColumnComponent({
  column,
  onAddCard,
  onDeleteColumn,
  onDeleteCard,
  onUpdateCard,
  onUpdateColumnTitle,
  onToggleComplete,
}: Props) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [addingCard, setAddingCard] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return
    onAddCard(column.id, newCardTitle.trim())
    setNewCardTitle('')
    setAddingCard(false)
  }

  const handleTitleSave = () => {
    if (!titleValue.trim()) {
      setTitleValue(column.title)
      setEditingTitle(false)
      return
    }
    if (titleValue.trim() !== column.title) {
      onUpdateColumnTitle(column.id, titleValue.trim())
    }
    setEditingTitle(false)
  }

  return (
    <>
      <div className="w-72 shrink-0">
        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3">
            {editingTitle ? (
              <input
                autoFocus
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') {
                    setTitleValue(column.title)
                    setEditingTitle(false)
                  }
                }}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent)] rounded px-2 py-0.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="font-semibold text-[var(--text-primary)] text-sm hover:text-[var(--accent)] transition-colors text-left"
                title="Başlığı düzenlemek için tıkla"
              >
                {column.title}
              </button>
            )}
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                column.cards.length === 0
                  ? 'bg-[var(--border)] text-[var(--text-muted)]'
                  : column.cards.length <= 3
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : column.cards.length <= 6
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {column.cards.length}
              </span>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors text-xs"
                aria-label="Sütunu sil"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Cards */}
          <div
            ref={setNodeRef}
            className={`min-h-16 space-y-2 transition-colors rounded-lg ${isOver ? 'bg-[var(--accent)]/10' : ''}`}
          >
            <SortableContext
              items={column.cards.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {column.cards.map(card => (
  <CardItem
    key={card.id}
    card={card}
    columnId={column.id}
    onDelete={onDeleteCard}
    onUpdate={onUpdateCard}
    onToggleComplete={onToggleComplete}
  />
))}
            </SortableContext>
          </div>

          {/* Add Card */}
          <div className="mt-2">
            {addingCard ? (
              <div className="bg-[var(--bg-card)] rounded-lg p-2">
                <input
                  autoFocus
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCard()
                    if (e.key === 'Escape') setAddingCard(false)
                  }}
                  placeholder="Kart başlığı..."
                  className="w-full border border-[var(--border)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCard}
                    className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Ekle
                  </button>
                  <button
                    onClick={() => setAddingCard(false)}
                    className="text-[var(--text-secondary)] px-3 py-1 rounded text-xs hover:bg-[var(--border)] transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCard(true)}
                className="w-full text-left text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm py-1 px-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                + Kart ekle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Sütunu Sil"
          description={`"${column.title}" sütununu ve içindeki ${column.cards.length} kartı silmek istediğinize emin misiniz?`}
          onConfirm={() => {
            onDeleteColumn(column.id)
            setConfirmDelete(false)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}