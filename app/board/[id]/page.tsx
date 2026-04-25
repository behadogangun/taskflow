import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BoardClient from './BoardClient'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single()

  if (!board) redirect('/dashboard')

  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', id)
    .order('position')

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .in('column_id', (columns || []).map(c => c.id))
    .order('position')

  const columnsWithCards = (columns || []).map(col => ({
    ...col,
    cards: (cards || []).filter(card => card.column_id === col.id)
  }))

  return <BoardClient board={board} initialColumns={columnsWithCards} />
}