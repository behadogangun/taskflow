import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Kendi board'ları
  const { data: ownBoards } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Collaborator olarak erişilen board'lar
  const { data: collabBoards } = await supabase
    .from('boards')
    .select('*')
    .neq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      boards={ownBoards || []}
      collabBoards={collabBoards || []}
      user={user}
    />
  )
}