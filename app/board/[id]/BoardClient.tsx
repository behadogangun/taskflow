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
  rectIntersection,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableColumn from './SortableColumn'
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts'
import Logo from '@/components/ui/Logo'
import ActivityLog from '@/components/board/ActivityLog'

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
  const [showActivity, setShowActivity] = useState(false)
  const router = useRouter()

  const {
    columns,
    activeCard,
    activeColumn,
    handleColumnDragStart,
    handleColumnDragEnd,
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
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 10 } })
  )

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

  const allCards = columns.flatMap(c => c.cards)
  const totalCards = allCards.length
  const completedCards = allCards.filter(c => c.completed).length
  const overdueCards = allCards.filter(c => {
    if (!c.due_date || c.completed) return false
    return new Date(c.due_date) < new Date()
  }).length
  const progressPercent = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0
  const progressColor =
  progressPercent === 100 ? 'bg-green-400' :
  progressPercent >= 75 ? 'bg-green-600' :
  progressPercent >= 40 ? 'bg-yellow-500' :
  'bg-red-500'

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
    const { error } = await supabase.from('boards').update({ title: boardTitle.trim() }).eq('id', board.id)
    if (error) setBoardTitle(board.title)
    setEditingBoardTitle(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">

      {/* Aktivite Paneli */}
      <div
        className="fixed right-0 top-0 h-full w-72 bg-[var(--bg-surface)] border-l border-[var(--border)] z-40 transform transition-transform duration-300"
        style={{ transform: showActivity ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">📋 Aktivite Geçmişi</h2>
          <button onClick={() => setShowActivity(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">✕</button>
        </div>
        <div className="p-4 overflow-y-auto h-full pb-20">
          <ActivityLog boardId={board.id} />
        </div>
      </div>

      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => router.push('/dashboard')} aria-label="Dashboard'a dön" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 text-sm">←</button>
          <div className="w-px h-5 bg-[var(--border)] shrink-0" />
          {editingBoardTitle ? (
            <input
              autoFocus
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={handleBoardTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBoardTitleSave()
                if (e.key === 'Escape') { setBoardTitle(board.title); setEditingBoardTitle(false) }
              }}
              className="bg-[var(--bg-primary)] border border-[var(--accent)] rounded px-2 py-0.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none w-32"
            />
          ) : (
            <button onClick={() => setEditingBoardTitle(true)} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate max-w-[120px] sm:max-w-xs" title={boardTitle}>
              {boardTitle}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowActivity(prev => !prev)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all hidden sm:block ${showActivity ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
          >
            📋 Aktiviteler
          </button>
          <button
            onClick={() => setShowActivity(prev => !prev)}
            className={`p-1.5 rounded-lg text-sm border transition-all sm:hidden ${showActivity ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            📋
          </button>
          <KeyboardShortcuts />
          <ThemeToggle />
          <Logo size="sm" />
        </div>
      </header>

      {/* Arama & Filtre Toolbar */}
      <div className="px-6 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Kart ara..."
    className="w-full border border-[var(--border)] rounded-lg pl-9 pr-8 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
  />
  {searchQuery && (
    <button
      onClick={() => setSearchQuery('')}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      ✕
    </button>
  )}
</div>
        <div className="flex items-center gap-1.5">
          {(['all', 'low', 'medium', 'high'] as const).map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filterPriority === p ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>
              {p === 'all' ? 'Tümü' : p === 'low' ? '🟢 Düşük' : p === 'medium' ? '🟡 Orta' : '🔴 Yüksek'}
            </button>
          ))}
        </div>
        <div className="relative group/tooltip">
          <button onClick={() => setSortByDate(prev => !prev)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${sortByDate ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>
            📅 Tarihe Göre Sırala
          </button>
          <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-xl p-3 z-50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">📅 Tarihe Göre Sırala</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">Her sütundaki kartları son teslim tarihine göre sıralar.</p>
          </div>
        </div>
        {(searchQuery || filterPriority !== 'all' || sortByDate) && (
          <button onClick={() => { setSearchQuery(''); setFilterPriority('all'); setSortByDate(false) }} className="text-xs text-red-500 hover:text-red-600 transition-colors">✕ Temizle</button>
        )}
      </div>

      {/* Board İstatistikleri */}
      {totalCards > 0 && (
        <div className="px-6 py-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-5 py-3 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Toplam</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{totalCards}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-[var(--text-muted)]">Tamamlanan</span>
              <span className="text-sm font-bold text-green-500">{completedCards}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-[var(--text-muted)]">Geciken</span>
              <span className="text-sm font-bold text-red-500">{overdueCards}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="text-xs text-[var(--text-muted)]">Devam Eden</span>
              <span className="text-sm font-bold text-[var(--accent)]">{totalCards - completedCards}</span>
            </div>
            <div className="flex items-center gap-3 min-w-48 flex-1">
              <div className="flex-1 h-3 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={`text-xs font-bold ${
  progressPercent === 100 ? 'text-green-400' :
  progressPercent >= 75 ? 'text-green-600' :
  progressPercent >= 40 ? 'text-yellow-500' :
  'text-red-500'
}`}>
                %{progressPercent}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Tahtası */}
      <div className="p-6 overflow-x-auto">
        <DndContext
  sensors={sensors}
  collisionDetection={(args) => {
    const activeId = args.active.id as string
    const isColumn = columns.some(c => c.id === activeId)
    return isColumn ? rectIntersection(args) : closestCorners(args)
  }}
  onDragStart={(e) => {
    const activeId = e.active.id as string
    const isColumn = columns.some(c => c.id === activeId)
    if (isColumn) {
      handleColumnDragStart(e)
    } else {
      handleDragStart(e)
    }
  }}
  onDragOver={(e) => {
    const activeId = e.active.id as string
    const isColumn = columns.some(c => c.id === activeId)
    if (!isColumn) handleDragOver(e)
  }}
  onDragEnd={(e) => {
    const activeId = e.active.id as string
    const isColumn = columns.some(c => c.id === activeId)
    if (isColumn) {
      handleColumnDragEnd(e)
    } else {
      handleDragEnd(e)
    }
  }}
>
          <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 items-start pb-4">
              {filteredColumns.map(column => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onAddCard={addCard}
                  onDeleteColumn={deleteColumn}
                  onDeleteCard={deleteCard}
                  onUpdateCard={updateCard}
                  onUpdateColumnTitle={updateColumnTitle}
                  onToggleComplete={toggleComplete}
                  cardSensors={sensors}
                  onCardDragStart={handleDragStart}
                  onCardDragOver={handleDragOver}
                  onCardDragEnd={handleDragEnd}
                  activeCard={activeCard}
                />
              ))}

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
                      <button onClick={handleAddColumn} disabled={!newColumnTitle.trim()} className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50">Ekle</button>
                      <button onClick={() => setAddingColumn(false)} className="text-[var(--text-secondary)] px-3 py-1.5 rounded-lg text-sm hover:bg-[var(--border)] transition-colors">İptal</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingColumn(true)} className="w-full bg-[var(--bg-surface)]/60 hover:bg-[var(--bg-surface)] rounded-xl p-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm font-medium transition-all border-2 border-dashed border-[var(--border)] hover:border-[var(--text-muted)]">
                    + Sütun Ekle
                  </button>
                )}
              </div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeCard ? (
              <div className="bg-[var(--bg-card)] border border-[var(--accent)] rounded-lg p-3 shadow-xl w-72 rotate-2 opacity-90">
                <p className="text-sm font-medium text-[var(--text-primary)]">{activeCard.title}</p>
              </div>
            ) : activeColumn ? (
              <div className="w-72 bg-[var(--bg-surface)] rounded-xl p-3 shadow-xl opacity-90 border border-[var(--accent)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{activeColumn.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Board boşsa empty state */}
      {columns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-6xl">📋</div>
          <div className="text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">Board boş!</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">İlk sütununu ekleyerek başla</p>
          </div>
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <span className="text-sm font-medium">Yukarıdan ekle</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-90">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}