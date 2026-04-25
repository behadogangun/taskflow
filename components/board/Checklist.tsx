'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChecklistItem } from '@/types'
import { useToast } from '@/components/providers/ToastProvider'
import { getNextPosition } from '@/lib/utils'

type Props = {
  cardId: string
}

export default function Checklist({ cardId }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItemTitle, setNewItemTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { showToast } = useToast()

  // Checklist itemlarını yükle
  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('checklists')
        .select('*')
        .eq('card_id', cardId)
        .order('position')

      if (data) setItems(data)
      setLoading(false)
    }

    fetchItems()
  }, [cardId])

  const handleAdd = async () => {
    if (!newItemTitle.trim()) return

    const position = getNextPosition(items)

    const { data, error } = await supabase
      .from('checklists')
      .insert({ card_id: cardId, title: newItemTitle.trim(), position })
      .select()
      .single()

    if (error) {
      showToast('Alt görev eklenirken hata oluştu.', 'error')
      return
    }

    setItems(prev => [...prev, data])
    setNewItemTitle('')
    setAdding(false)
  }

  const handleToggle = async (item: ChecklistItem) => {
    const { error } = await supabase
      .from('checklists')
      .update({ completed: !item.completed })
      .eq('id', item.id)

    if (error) {
      showToast('Güncellenirken hata oluştu.', 'error')
      return
    }

    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, completed: !i.completed } : i
    ))
  }

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', itemId)

    if (error) {
      showToast('Silinirken hata oluştu.', 'error')
      return
    }

    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  // İlerleme hesapla
  const completedCount = items.filter(i => i.completed).length
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  if (loading) return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-6 bg-[var(--border)] rounded animate-pulse" />
      ))}
    </div>
  )

  return (
    <div>
      {/* İlerleme çubuğu */}
      {items.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-muted)]">
              {completedCount}/{items.length} tamamlandı
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist itemları */}
      <div className="space-y-1.5 mb-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => handleToggle(item)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {item.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`text-sm flex-1 ${
              item.completed
                ? 'line-through text-[var(--text-muted)]'
                : 'text-[var(--text-primary)]'
            }`}>
              {item.title}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Yeni item ekle */}
      {adding ? (
        <div className="flex gap-2 mt-2">
          <input
            autoFocus
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="Alt görev..."
            className="flex-1 border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            onClick={handleAdd}
            className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs hover:bg-[var(--accent-hover)] transition-colors"
          >
            Ekle
          </button>
          <button
            onClick={() => setAdding(false)}
            className="text-[var(--text-secondary)] px-2 py-1 rounded text-xs hover:bg-[var(--border)] transition-colors"
          >
            İptal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mt-1"
        >
          + Alt görev ekle
        </button>
      )}
    </div>
  )
}