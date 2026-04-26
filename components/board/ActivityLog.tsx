'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity } from '@/types'
import { formatDate } from '@/lib/utils'

type Props = {
  boardId: string
}

const actionIcons: Record<string, string> = {
  created: '✨',
  updated: '✏️',
  moved: '↔️',
  completed: '✅',
  uncompleted: '↩️',
}

const actionColors: Record<string, string> = {
  created: 'text-green-500',
  updated: 'text-blue-500',
  moved: 'text-yellow-500',
  completed: 'text-green-500',
  uncompleted: 'text-[var(--text-muted)]',
}

export default function ActivityLog({ boardId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = createClient()

    // İlk yükleme
    const fetchActivities = async () => {
      const { data } = await client
        .from('activities')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) setActivities(data)
      setLoading(false)
    }

    fetchActivities()

    // Realtime subscription — yeni aktivite gelince otomatik güncelle
    const subscription = client
      .channel(`activities:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setActivities(prev => [payload.new as Activity, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [boardId])

  if (loading) return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-10 bg-[var(--border)] rounded-lg animate-pulse" />
      ))}
    </div>
  )

  if (activities.length === 0) return (
    <div className="text-center py-6 border border-dashed border-[var(--border)] rounded-xl">
      <p className="text-sm text-[var(--text-muted)]">Henüz aktivite yok</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)]"
        >
          <span className="text-base shrink-0 mt-0.5">
            {actionIcons[activity.action] || '📌'}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${actionColors[activity.action] || 'text-[var(--text-primary)]'}`}>
              {activity.detail || activity.action}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {formatDate(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}