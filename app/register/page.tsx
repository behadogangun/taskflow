'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
    setLoading(true)
    setError(null)

    if (!fullName.trim()) {
      setError('İsim soyisim gerekli.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() }
      }
    })

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Hesap Oluştur</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">TaskFlow&apos;a katılmak için kayıt ol</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                İsim Soyisim
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Adınız Soyadınız"
              />
            </div>

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
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !email.trim() || !password.trim() || !fullName.trim()}
              className="w-full bg-[var(--accent)] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}