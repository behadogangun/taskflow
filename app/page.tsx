import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Logo size="md" href="/" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-secondary)] mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Ücretsiz kullanmaya başla
        </div>

        {/* Başlık */}
        <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-primary)] max-w-3xl leading-tight mb-6">
          Ekibinizin görevlerini{' '}
          <span className="text-[var(--accent)]">kolayca</span>{' '}
          yönetin
        </h1>

        <p className="text-lg text-[var(--text-secondary)] max-w-xl mb-10 leading-relaxed">
          TaskFlow ile projelerinizi Kanban tahtalarıyla takip edin.
          Sürükle-bırak ile görevleri yönetin, önceliklendirin ve ekibinizle senkronize kalın.
        </p>

        {/* CTA Butonları */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-[var(--accent)] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-[var(--accent)]/20 text-center"
          >
            Hemen Başla →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] px-8 py-3 rounded-xl text-sm font-semibold hover:shadow-md transition-all text-center"
          >
            Giriş Yap
          </Link>
        </div>

        {/* Özellikler */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          <FeatureCard
            icon="🎯"
            title="Öncelik Sistemi"
            description="Kartları düşük, orta ve yüksek öncelikle flagleyin."
          />
          <FeatureCard
            icon="🖱️"
            title="Sürükle & Bırak"
            description="Görevleri sütunlar arasında kolayca taşıyın."
          />
          <FeatureCard
            icon="🌙"
            title="Dark Mode"
            description="Göz yormayan karanlık tema desteği."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
        © 2026 TaskFlow. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}

type FeatureCardProps = {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  )
}