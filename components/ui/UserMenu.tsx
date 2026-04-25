'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/providers/ThemeProvider'
import { User } from '@supabase/supabase-js'

type Props = {
  user: User
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'menu' | 'settings'>('menu')
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const supabase = createClient()

  const avatar = user.email?.charAt(0).toUpperCase() || '?'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setTab('menu')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar butonu */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
        aria-label="Kullanıcı menüsü"
      >
        {avatar}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Kullanıcı bilgisi */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">Giriş yapıldı</p>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.email}</p>
          </div>

          {/* Tab seçici */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setTab('menu')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === 'menu'
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Menü
            </button>
            <button
              onClick={() => setTab('settings')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === 'settings'
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Ayarlar
            </button>
          </div>

          {/* Menü tab */}
          {tab === 'menu' && (
            <div className="px-2 py-2">
              <button
                onClick={() => { router.push('/dashboard'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--border)] transition-colors text-left"
              >
                <span className="text-base">📋</span>
                <span className="text-sm text-[var(--text-primary)]">Dashboard</span>
              </button>

              <button
                onClick={() => { router.push('/profile'); setOpen(false) }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--border)] transition-colors text-left"
              >
                <span className="text-base">👤</span>
                <span className="text-sm text-[var(--text-primary)]">Profil & Davet</span>
              </button>

              <div className="border-t border-[var(--border)] mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
                >
                  <span className="text-base">🚪</span>
                  <span className="text-sm text-red-500 group-hover:text-red-600">Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}

          {/* Ayarlar tab */}
          {tab === 'settings' && (
            <div className="px-2 py-2 space-y-1">
             {/* Karanlık mod */}
<div className="px-2 py-2 rounded-lg">
  <div className="flex items-center gap-2 mb-2">
    <span className="text-base">🎨</span>
    <span className="text-sm text-[var(--text-primary)]">Tema</span>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => theme === 'dark' && toggleTheme()}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
        theme === 'light'
          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
          : 'border-[var(--border)] hover:border-[var(--text-muted)]'
      }`}
    >
      <span className="text-xl">☀️</span>
      <span className={`text-xs font-medium ${
        theme === 'light' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
      }`}>Açık</span>
    </button>
    <button
      onClick={() => theme === 'light' && toggleTheme()}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
        theme === 'dark'
          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
          : 'border-[var(--border)] hover:border-[var(--text-muted)]'
      }`}
    >
      <span className="text-xl">🌙</span>
      <span className={`text-xs font-medium ${
        theme === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
      }`}>Karanlık</span>
    </button>
  </div>
</div>

              {/* Dil */}
              <div className="flex items-center justify-between px-2 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌐</span>
                  <span className="text-sm text-[var(--text-primary)]">Dil</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
                  Türkçe
                </span>
              </div>

              {/* Bildirimler */}
              <div className="flex items-center justify-between px-2 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <span className="text-sm text-[var(--text-primary)]">Bildirimler</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
                  Açık
                </span>
              </div>

              {/* Versiyon */}
              <div className="flex items-center justify-between px-2 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <span className="text-sm text-[var(--text-primary)]">Versiyon</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
                  v1.0.0
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}