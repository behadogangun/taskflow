'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBoards } from '@/hooks/useBoards'
import { formatDate } from '@/lib/utils'
import { Board } from '@/types'
import { User } from '@supabase/supabase-js'
import Logo from '@/components/ui/Logo'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import UserMenu from '@/components/ui/UserMenu'

const BOARD_COLORS = [
  '#0052CC', '#00875A', '#FF5630', '#FF8B00',
  '#6554C0', '#00B8D9', '#172B4D', '#42526E',
]

type Props = {
  boards: Board[]
  collabBoards: Board[]
  user: User
  urgentCardCount: number
  overdueCardCount: number
}

export default function DashboardClient({ boards: initialBoards, collabBoards, user, urgentCardCount, overdueCardCount }: Props) {
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState('#0052CC')
  const [search, setSearch] = useState('')
  const { boards, loading, createBoard, deleteBoard } = useBoards(initialBoards, user)
  const router = useRouter()

  const handleCreateBoard = async () => {
    const success = await createBoard(newBoardTitle, selectedColor)
    if (success) {
      setNewBoardTitle('')
      setSelectedColor('#0052CC')
    }
  }

  const filteredBoards = boards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCollabBoards = collabBoards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <UserMenu user={user} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">Board&apos;larım</h2>
          {/* Uyarı Bandı */}
{(overdueCardCount > 0 || urgentCardCount > 0) && (
  <div className="flex flex-col sm:flex-row gap-2 mb-6">
    {overdueCardCount > 0 && (
      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 flex-1">
        <span className="text-red-500 text-base">🚨</span>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          <span className="font-bold">{overdueCardCount}</span> kart gecikmiş durumda
        </p>
      </div>
    )}
    {urgentCardCount > 0 && (
      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-2.5 flex-1">
        <span className="text-yellow-500 text-base">⚠️</span>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
          <span className="font-bold">{urgentCardCount}</span> kart bugün veya yarın bitiyor
        </p>
      </div>
    )}
  </div>
)}
        {/* Yeni Board Oluştur */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
              placeholder="Yeni board adı..."
              className="flex-1 border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              onClick={handleCreateBoard}
              disabled={loading || !newBoardTitle.trim()}
              className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Oluşturuluyor...' : '+ Oluştur'}
            </button>
          </div>
          {/* Renk seçici */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Renk:</span>
            <div className="flex gap-1.5">
              {BOARD_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-[var(--accent)]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Renk seç: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Arama */}
        {(boards.length > 0 || collabBoards.length > 0) && (
          <div className="relative mb-6">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Board ara..."
              className="w-full border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        )}

        {/* Kendi Board'larım */}
        {filteredBoards.length === 0 && boards.length === 0 ? (
  <div className="text-center py-16 flex flex-col items-center gap-4">
    <div className="text-6xl">🗂️</div>
    <div>
      <p className="text-lg font-semibold text-[var(--text-primary)]">Henüz hiç board yok!</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">İlk board&apos;unu oluşturmak için yukarıya bak</p>
    </div>
    
  </div>
        ) : filteredBoards.length === 0 && boards.length === 0 ? (
  <div className="text-center py-16 flex flex-col items-center gap-4">
    <div className="text-6xl animate-bounce">🗂️</div>
    <div>
      <p className="text-lg font-semibold text-[var(--text-primary)]">Henüz hiç board yok!</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">İlk board&apos;unu oluşturmak için yukarıya bak</p>
    </div>
    <div className="flex items-center gap-2 text-[var(--accent)]">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="-scale-x-100 -rotate-45">
        <path d="M10 30 Q10 10 30 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="4 3"/>
        <path d="M26 6 L30 10 L26 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-medium">Buradan oluştur</span>
    </div>
  </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() => router.push(`/board/${board.id}`)}
                onDelete={() => deleteBoard(board.id)}
                isOwner
              />
            ))}
          </div>
        )}

        {/* Collaborator Board'ları */}
        {filteredCollabBoards.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Paylaşılan Board&apos;lar
              </h3>
              <span className="text-xs bg-[var(--border)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                {filteredCollabBoards.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCollabBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onOpen={() => router.push(`/board/${board.id}`)}
                  onDelete={() => {}}
                  isOwner={false}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ─── Alt Bileşen: BoardCard ──────────────────────────────────────

type BoardCardProps = {
  board: Board
  onOpen: () => void
  onDelete: () => void
  isOwner: boolean
}

function BoardCard({ board, onOpen, onDelete, isOwner }: BoardCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Toplam kart sayısını hesapla
  const cardCount = (board as Board & { columns?: { cards?: { id: string }[] }[] }).columns?.reduce(
  (acc: number, col: { cards?: { id: string }[] }) => acc + (col.cards?.length || 0), 0
) || 0
  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow group flex flex-col min-h-[140px]">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: board.color || '#0052CC' }}
        />
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div className="flex items-start justify-between">
            <button onClick={onOpen} className="flex-1 text-left">
              <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {board.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{formatDate(board.created_at)}</p>
            </button>
            {isOwner && (
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label="Board'u sil"
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-2 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-[var(--text-muted)]">
              🃏 {cardCount} kart
            </span>
            {!isOwner && (
              <span className="text-xs text-[var(--accent)] font-medium">
                👥 Paylaşılan
              </span>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Board'u Sil"
          description={`"${board.title}" board'unu ve tüm içeriğini silmek istediğinize emin misiniz?`}
          onConfirm={() => {
            onDelete()
            setConfirmDelete(false)
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}