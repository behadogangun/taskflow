'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/types'
import { useToast } from '@/components/providers/ToastProvider'
import { formatDate } from '@/lib/utils'

type Props = {
  cardId: string
}

export default function Comments({ cardId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState('U')
  const [displayName, setDisplayName] = useState('Sen')
  const { showToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const client = createClient()

      // Yorumları çek
      const { data: commentsData } = await client
        .from('comments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })

      if (commentsData) setComments(commentsData)

      // Kullanıcı adını çek
      const { data: { user } } = await client.auth.getUser()
      if (user) {
        const { data: profile } = await client
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (profile?.full_name) {
          setUserName(profile.full_name.charAt(0).toUpperCase())
          setDisplayName(profile.full_name)
        } else if (user.email) {
          setUserName(user.email.charAt(0).toUpperCase())
          setDisplayName(user.email)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [cardId])

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, user_id: user.id, content: newComment.trim() })
      .select()
      .single()

    if (error) {
      showToast('Yorum eklenirken hata oluştu.', 'error')
      setSubmitting(false)
      return
    }

    setComments(prev => [data, ...prev])
    setNewComment('')
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      showToast('Yorum silinirken hata oluştu.', 'error')
      return
    }

    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  if (loading) return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-14 bg-[var(--border)] rounded-xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Yorum yaz */}
      <div className="flex flex-col gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Bir yorum yaz... (Enter ile gönder, Shift+Enter satır atla)"
          rows={2}
          className="w-full border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none transition-all"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="bg-[var(--accent)] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>✉️ Gönder</>
            )}
          </button>
        </div>
      </div>

      {/* Yorum sayısı */}
      {comments.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] font-medium">
          {comments.length} yorum
        </p>
      )}

      {/* Yorum listesi */}
      {comments.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-[var(--border)] rounded-xl">
          <p className="text-xs text-[var(--text-muted)]">Henüz yorum yok</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">İlk yorumu sen yap!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-3 group hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {userName}
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {displayName}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">·</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
                  aria-label="Yorumu sil"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed pl-7">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}