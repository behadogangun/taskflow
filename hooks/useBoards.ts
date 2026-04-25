import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Board } from '@/types'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/components/providers/ToastProvider'

/**
 * Board CRUD işlemlerini yöneten custom hook.
 * UI'dan bağımsız olarak tüm veri işlemlerini burada tutar.
 */
export function useBoards(initialBoards: Board[], user: User) {
  const [boards, setBoards] = useState<Board[]>(initialBoards)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const supabase = createClient()

  const createBoard = async (title: string, color: string): Promise<boolean> => {
    if (!title.trim()) return false
    setLoading(true)

    const { data, error } = await supabase
      .from('boards')
      .insert({ title: title.trim(), owner_id: user.id, color })
      .select()
      .single()

    if (error) {
      showToast('Board oluşturulurken bir hata oluştu.', 'error')
      setLoading(false)
      return false
    }

    setBoards(prev => [data, ...prev])
    showToast('Board başarıyla oluşturuldu!', 'success')
    setLoading(false)
    return true
  }

  const deleteBoard = async (boardId: string): Promise<void> => {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)

    if (error) {
      showToast('Board silinirken bir hata oluştu.', 'error')
      return
    }

    setBoards(prev => prev.filter(b => b.id !== boardId))
    showToast('Board silindi.', 'delete')
  }

  return { boards, loading, createBoard, deleteBoard }
}