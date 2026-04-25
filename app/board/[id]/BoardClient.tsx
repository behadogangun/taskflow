'use client'

import { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useRouter } from 'next/navigation'
import { Board, ColumnWithCards } from '@/types'
import { useBoard } from '@/hooks/useBoard'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import ColumnComponent from './Column'
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts'
import Logo from '@/components/ui/Logo'

type Props = {
  board: Board
  initialColumns: ColumnWithCards[]
}

export default function BoardClient({ board, initialColumns }: Props) {
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [addingColumn, setAddingColumn] = useState(false)
  const [editingBoardTitle, setEditingBoardTitle] = useState(false)
  const [boardTitle, setBoardTitle] = useState(board.title)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortByDate, setSortByDate] = useState(false)
  const router = useRouter()

  const {
  columns,
  activeCard,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  addColumn,
  deleteColumn,
  updateColumnTitle,
  addCard,
  deleteCard,
  updateCard,
  toggleComplete,
} = useBoard(initialColumns, board.id)

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.ctrlKey && e.shiftKey && e.key === 'N') setAddingColumn(true)
      if (e.ctrlKey && e.shiftKey && e.key === 'B') router.push('/dashboard')
      if (e.ctrlKey && e.shiftKey && e.key === 'D') document.documentElement.classList.toggle('dark')
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  // Arama, öncelik filtrelemesi ve tarihe göre sıralama
  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards
      .filter(card => {
        const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (card.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
        const matchesPriority = filterPriority === 'all' || card.priority === filterPriority
        return matchesSearch && matchesPriority
      })
      .sort((a, b) => {
        if (!sortByDate) return 0
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
  }))

  const handleAddColumn = async () => {
    const success = await addColumn(newColumnTitle)
    if (success) {
      setNewColumnTitle('')
      setAddingColumn(false)
    }
  }

  const handleBoardTitleSave = async () => {
    if (!boardTitle.trim()) {
      setBoardTitle(board.title)
      setEditingBoardTitle(false)
      return
    }
    if (boardTitle.trim() === board.title) {
      setEditingBoardTitle(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('boards')
      .update({ title: boardTitle.trim() })
      .eq('id', board.id)

    if (error) {
      setBoardTitle(board.title)
    }

    setEditingBoardTitle(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            aria-label="Dashboard'a dön"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Geri
          </button>
          <div className="w-px h-5 bg-[var(--border)]" />
          {editingBoardTitle ? (
            <input
              autoFocus
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={handleBoardTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBoardTitleSave()
                if (e.key === 'Escape') {
                  setBoardTitle(board.title)
                  setEditingBoardTitle(false)
                }
              }}
              className="bg-[var(--bg-primary)] border border-[var(--accent)] rounded px-2 py-0.5 text-base font-semibold text-[var(--text-primary)] focus:outline-none w-48"
            />
          ) : (
            <button
              onClick={() => setEditingBoardTitle(true)}
              className="text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              title="Board başlığını düzenlemek için tıkla"
            >
              {boardTitle}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <KeyboardShortcuts />
          <ThemeToggle />
          <Logo size="sm" />
        </div>
      </header>

      {/* Arama & Filtre Toolbar */}
      <div className="px-6 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kart ara..."
            className="w-full border border-[var(--border)] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'low', 'medium', 'high'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterPriority === p
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {p === 'all' ? 'Tümü' : p === 'low' ? '🟢 Düşük' : p === 'medium' ? '🟡 Orta' : '🔴 Yüksek'}
            </button>
          ))}
        </div>

        {/* Tarihe göre sırala */}
        <div className="relative group/tooltip">
          <button
            onClick={() => setSortByDate(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              sortByDate
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            📅 Tarihe Göre Sırala
          </button>

          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-xl p-3 z-50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">📅 Tarihe Göre Sırala</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Her sütundaki kartları son teslim tarihine göre sıralar. En yakın tarihli kart en üstte görünür. Tarihi olmayan kartlar en alta taşınır.
            </p>
          </div>
        </div>

        {/* Aktif filtre varsa temizle */}
        {(searchQuery || filterPriority !== 'all' || sortByDate) && (
          <button
            onClick={() => { setSearchQuery(''); setFilterPriority('all'); setSortByDate(false) }}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            ✕ Temizle
          </button>
        )}
      </div>

      {/* Kanban Tahtası */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-wrap gap-4 items-start">
            <SortableContext
              items={filteredColumns.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map(column => (
                <ColumnComponent
  key={column.id}
  column={column}
  onAddCard={addCard}
  onDeleteColumn={deleteColumn}
  onDeleteCard={deleteCard}
  onUpdateCard={updateCard}
  onUpdateColumnTitle={updateColumnTitle}
  onToggleComplete={toggleComplete}
/>
              ))}
            </SortableContext>

            {/* Yeni Sütun Ekle */}
            <div className="w-72 shrink-0">
              {addingColumn ? (
                <div className="bg-[var(--bg-surface)] rounded-xl p-3 shadow-sm">
                  <input
                    autoFocus
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddColumn()
                      if (e.key === 'Escape') setAddingColumn(false)
                    }}
                    placeholder="Sütun adı..."
                    className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColumn}
                      disabled={!newColumnTitle.trim()}
                      className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setAddingColumn(false)}
                      className="text-[var(--text-secondary)] px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--border)] transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="w-full bg-[var(--bg-surface)]/60 hover:bg-[var(--bg-surface)] rounded-xl p-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm font-medium transition-all border-2 border-dashed border-[var(--border)] hover:border-[var(--text-muted)]"
                >
                  + Sütun Ekle
                </button>
              )}
            </div>
          </div>

          {/* Sürükleme sırasında kartın görsel kopyası */}
          <DragOverlay>
            {activeCard && (
              <div className="bg-[var(--bg-card)] border border-[var(--accent)] rounded-lg p-3 shadow-xl w-72 rotate-2 opacity-90">
                <p className="text-sm font-medium text-[var(--text-primary)]">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}