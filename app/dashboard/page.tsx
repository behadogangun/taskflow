import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ownBoards } = await supabase
    .from('boards')
    .select('*, columns(cards(id))')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: collabBoards } = await supabase
    .from('boards')
    .select('*, columns(cards(id))')
    .neq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: urgentCards } = await supabase
    .from('cards')
    .select('id, title, due_date, columns(board_id, boards(id, title))')
    .eq('completed', false)
    .lte('due_date', tomorrow.toISOString().split('T')[0])
    .gte('due_date', today.toISOString().split('T')[0])

  const { data: overdueCards } = await supabase
    .from('cards')
    .select('id, title, due_date, columns(board_id, boards(id, title))')
    .eq('completed', false)
    .lt('due_date', today.toISOString().split('T')[0])

  return (
    <DashboardClient
      boards={ownBoards || []}
      collabBoards={collabBoards || []}
      user={user}
      urgentCards={(urgentCards || []) as unknown as {id: string, title: string, due_date: string, columns: {board_id: string, boards: {id: string, title: string}}}[]}
      overdueCards={(overdueCards || []) as unknown as {id: string, title: string, due_date: string, columns: {board_id: string, boards: {id: string, title: string}}}[]}
    />
  )
}