import { useState, useRef } from 'react'
import { useToast } from '@/components/providers/ToastProvider'
import { createClient } from '@/lib/supabase/client'
import { Card, ColumnWithCards, Priority } from '@/types'
import { getNextPosition } from '@/lib/utils'
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

/**
 * Kanban tahtasının tüm state ve işlemlerini yöneten custom hook.
 * Sürükle-bırak, kart ve sütun CRUD işlemlerini kapsar.
 */
export function useBoard(initialColumns: ColumnWithCards[], boardId: string) {
  const [columns, setColumns] = useState<ColumnWithCards[]>(initialColumns)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const sourceColumnIdRef = useRef<string | null>(null)
  const supabase = createClient()
  const { showToast } = useToast()

  // ─── Aktivite Kaydet ─────────────────────────────────────────────

  const logActivity = async (
    cardId: string,
    action: string,
    detail?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('activities').insert({
      card_id: cardId,
      board_id: boardId,
      user_id: user.id,
      action,
      detail: detail || null,
    })
  }

  // ─── Drag & Drop ────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const card = columns.flatMap(c => c.cards).find(c => c.id === event.active.id)
    if (card) {
      setActiveCard(card)
      // Kaynak sütunu drag başında kaydet
      const sourceCol = columns.find(c => c.cards.some(cd => cd.id === card.id))
      sourceColumnIdRef.current = sourceCol?.id || null
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const sourceCol = columns.find(c => c.cards.some(card => card.id === activeId))
    const targetCol = columns.find(c => c.id === overId || c.cards.some(card => card.id === overId))

    if (!sourceCol || !targetCol) return

    if (sourceCol.id !== targetCol.id) {
      setColumns(prev => {
        const activeCard = sourceCol.cards.find(c => c.id === activeId)!
        const overIndex = targetCol.cards.findIndex(c => c.id === overId)
        const insertIndex = overIndex >= 0 ? overIndex : targetCol.cards.length

        return prev.map(col => {
          if (col.id === sourceCol.id) {
            return { ...col, cards: col.cards.filter(c => c.id !== activeId) }
          }
          if (col.id === targetCol.id) {
            const newCards = [...col.cards]
            newCards.splice(insertIndex, 0, activeCard)
            return { ...col, cards: newCards }
          }
          return col
        })
      })
      return
    }

    setColumns(prev => prev.map(col => {
      if (col.id !== sourceCol.id) return col
      const oldIndex = col.cards.findIndex(c => c.id === activeId)
      const newIndex = col.cards.findIndex(c => c.id === overId)
      if (oldIndex === -1 || newIndex === -1) return col
      return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) }
    }))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const draggedCard = activeCard
    const originalSourceColId = sourceColumnIdRef.current
    setActiveCard(null)
    sourceColumnIdRef.current = null
    if (!over) return

    const activeId = active.id as string
    const targetCol = columns.find(c => c.cards.some(card => card.id === activeId))
    if (!targetCol) return

    const cardIndex = targetCol.cards.findIndex(c => c.id === activeId)
    const prevCard = targetCol.cards[cardIndex - 1]
    const nextCard = targetCol.cards[cardIndex + 1]

    let newPosition: number
    if (!prevCard && !nextCard) {
      newPosition = 1000
    } else if (!prevCard) {
      newPosition = nextCard.position / 2
    } else if (!nextCard) {
      newPosition = prevCard.position + 1000
    } else {
      newPosition = (prevCard.position + nextCard.position) / 2
    }

    const { error } = await supabase
      .from('cards')
      .update({ column_id: targetCol.id, position: newPosition })
      .eq('id', activeId)

    if (error) {
      showToast('Kart taşınırken bir hata oluştu.', 'error')
      return
    }

    // Farklı sütuna taşındıysa aktivite kaydet
    if (draggedCard && originalSourceColId && originalSourceColId !== targetCol.id) {
      const sourceColTitle = columns.find(c => c.id === originalSourceColId)?.title || 'Bilinmiyor'
      await logActivity(
        activeId,
        'moved',
        `"${draggedCard.title}" kartı "${sourceColTitle}" → "${targetCol.title}" sütununa taşındı`
      )
    }
  }

  // ─── Sütun İşlemleri ────────────────────────────────────────────

  const addColumn = async (title: string): Promise<boolean> => {
    if (!title.trim()) return false

    const position = getNextPosition(columns)

    const { data, error } = await supabase
      .from('columns')
      .insert({ board_id: boardId, title: title.trim(), position })
      .select()
      .single()

    if (error) {
      showToast('Sütun eklenirken bir hata oluştu.', 'error')
      return false
    }

    setColumns(prev => [...prev, { ...data, cards: [] }])
    showToast('Sütun eklendi.', 'success')
    return true
  }

  const deleteColumn = async (columnId: string): Promise<void> => {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId)

    if (error) {
      showToast('Sütun silinirken bir hata oluştu.', 'error')
      return
    }

    setColumns(prev => prev.filter(c => c.id !== columnId))
    showToast('Sütun silindi.', 'delete')
  }

  const updateColumnTitle = async (columnId: string, title: string): Promise<void> => {
    const { error } = await supabase
      .from('columns')
      .update({ title: title.trim() })
      .eq('id', columnId)

    if (error) {
      showToast('Sütun başlığı güncellenirken hata oluştu.', 'error')
      return
    }

    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, title: title.trim() } : col
    ))
    showToast('Sütun başlığı güncellendi.', 'success')
  }

  // ─── Kart İşlemleri ─────────────────────────────────────────────

  const addCard = async (columnId: string, title: string): Promise<boolean> => {
    if (!title.trim()) return false

    const column = columns.find(c => c.id === columnId)
    if (!column) return false

    const position = getNextPosition(column.cards)

    const { data, error } = await supabase
      .from('cards')
      .insert({ column_id: columnId, title: title.trim(), position })
      .select()
      .single()

    if (error) {
      showToast('Kart eklenirken bir hata oluştu.', 'error')
      return false
    }

    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, cards: [...col.cards, data] } : col
    ))
    showToast('Kart eklendi.', 'success')
    await logActivity(data.id, 'created', `"${title.trim()}" kartı oluşturuldu`)
    return true
  }

  const deleteCard = async (cardId: string, columnId: string): Promise<void> => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      showToast('Kart silinirken bir hata oluştu.', 'error')
      return
    }

    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    ))
    showToast('Kart silindi.', 'delete')
  }

  const updateCard = async (
  cardId: string,
  columnId: string,
  title: string,
  description: string,
  priority: Priority,
  dueDate: string | null,
  assignee: string | null,
  labels: string[]
): Promise<void> => {
  const { error } = await supabase
    .from('cards')
    .update({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate,
      assignee,
      labels,
    })
    .eq('id', cardId)

  if (error) {
    showToast('Kart güncellenirken bir hata oluştu.', 'error')
    return
  }

  setColumns(prev => prev.map(col =>
    col.id === columnId
      ? {
          ...col,
          cards: col.cards.map(c =>
            c.id === cardId
              ? { ...c, title: title.trim(), description: description.trim(), priority, due_date: dueDate, assignee, labels }
              : c
          ),
        }
      : col
  ))
  showToast('Kart güncellendi.', 'success')
  await logActivity(cardId, 'updated', `"${title.trim()}" kartı güncellendi`)
}

  // ─── Kart Tamamlama ─────────────────────────────────────────────

  const toggleComplete = async (
    cardId: string,
    columnId: string,
    completed: boolean,
    completedBy: string
  ): Promise<void> => {
    const { error } = await supabase
      .from('cards')
      .update({ completed, completed_by: completed ? completedBy : null })
      .eq('id', cardId)

    if (error) {
      showToast('Kart güncellenirken hata oluştu.', 'error')
      return
    }

    const card = columns.flatMap(c => c.cards).find(c => c.id === cardId)

    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(c =>
              c.id === cardId
                ? { ...c, completed, completed_by: completed ? completedBy : null }
                : c
            ),
          }
        : col
    ))

    await logActivity(
      cardId,
      completed ? 'completed' : 'uncompleted',
      completed
        ? `"${card?.title}" kartı ${completedBy} tarafından tamamlandı`
        : `"${card?.title}" kartı tamamlanmadı olarak işaretlendi`
    )
  }

  return {
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
  }
}