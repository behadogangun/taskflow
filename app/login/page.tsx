'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Logo href="/" />
        <ThemeToggle />
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-8 rounded-xl shadow-sm w-full max-w-md">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Giriş Yap</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">TaskFlow hesabına hoş geldin</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-[var(--accent)] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
            Hesabın yok mu?{' '}
            <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}