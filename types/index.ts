export type Priority = 'low' | 'medium' | 'high'

export type Board = {
  id: string
  title: string
  owner_id: string
  color: string
  created_at: string
}

export type Column = {
  id: string
  board_id: string
  title: string
  position: number
  created_at: string
}



export type ColumnWithCards = Column & {
  cards: Card[]
}

export type BoardWithColumns = Board & {
  columns: ColumnWithCards[]
}

export type DbResult<T> = {
  data: T | null
  error: string | null
}

export type ChecklistItem = {
  id: string
  card_id: string
  title: string
  completed: boolean
  position: number
  created_at: string
}

export type Card = {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
  priority: Priority | null
  due_date: string | null
  labels: string[]
  assignee: string | null
  completed: boolean
  completed_by: string | null
  created_at: string
}

export type Comment = {
  id: string
  card_id: string
  user_id: string
  content: string
  created_at: string
}

export type Activity = {
  id: string
  card_id: string
  board_id: string
  user_id: string
  action: string
  detail: string | null
  created_at: string
}

