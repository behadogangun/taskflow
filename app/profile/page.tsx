import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { count: boardCount } = await supabase
    .from('boards')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  const { count: cardCount } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })

  return (
    <ProfileClient
      user={user}
      boardCount={boardCount || 0}
      cardCount={cardCount || 0}
    />
  )
}