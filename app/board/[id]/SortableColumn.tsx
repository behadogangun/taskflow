'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ColumnWithCards, Priority, Card } from '@/types'
import ColumnComponent from './Column'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import type { SensorDescriptor, SensorOptions } from '@dnd-kit/core'

type Props = {
  column: ColumnWithCards
  onAddCard: (columnId: string, title: string) => void
  onDeleteColumn: (columnId: string) => void
  onDeleteCard: (cardId: string, columnId: string) => void
  onUpdateCard: (cardId: string, columnId: string, title: string, description: string, priority: Priority | null, dueDate: string | null, assignee: string | null, labels: string[]) => void
  onUpdateColumnTitle: (columnId: string, title: string) => void
  onToggleComplete: (cardId: string, columnId: string, completed: boolean, completedBy: string) => void
  cardSensors: SensorDescriptor<SensorOptions>[]
  onCardDragStart: (event: DragStartEvent) => void
  onCardDragOver: (event: DragOverEvent) => void
  onCardDragEnd: (event: DragEndEvent) => void
  activeCard: Card | null
}

export default function SortableColumn({ activeCard, cardSensors, onCardDragStart, onCardDragOver, onCardDragEnd, ...props }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <ColumnComponent
      {...props}
      innerRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragHandleAttributes={attributes}
      dragHandleListeners={listeners}
    />
  )
}