'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/providers/ToastProvider'
import { User } from '@supabase/supabase-js'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

type Props = {
  user: User
  boardCount: number
  cardCount: number
}

export default function ProfileClient({ user, boardCount, cardCount }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [collaborators, setCollaborators] = useState<{ id: string; email: string; name: string }[]>([])
  const [joinedWorkspaces, setJoinedWorkspaces] = useState<{ id: string; owner_id: string; name: string }[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const client = createClient()

      // Davet kodunu çek
      const { data: invitation } = await client
        .from('invitations')
        .select('code')
        .eq('owner_id', user.id)
        .single()

      if (invitation) setInviteCode(invitation.code)

      // Benim workspace'ime katılanları çek
      const { data: collabs } = await client
        .from('collaborators')
        .select('collaborator_id')
        .eq('owner_id', user.id)

      if (collabs && collabs.length > 0) {
        const ids = collabs.map(c => c.collaborator_id)
        const { data: users } = await client
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ids)

        if (users) {
          setCollaborators(users.map(u => ({
            id: u.id,
            email: u.email || 'Email yok',
            name: u.full_name || 'İsimsiz'
          })))
        }
      }

      // Katıldığım workspace'leri çek
      const { data: joined } = await client
        .from('collaborators')
        .select('owner_id')
        .eq('collaborator_id', user.id)
        

      if (joined && joined.length > 0) {
        const ownerIds = joined.map(j => j.owner_id)
        const { data: owners } = await client
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds)
        
        if (owners) {
          setJoinedWorkspaces(owners.map(o => ({
            id: o.id,
            owner_id: o.id,
            name: o.full_name || o.email || 'İsimsiz'
          })))
        }
      }
    }

    fetchData()
  }, [user.id])

  const handleGenerateCode = async () => {
    const code = crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase()

    const { error } = await supabase
      .from('invitations')
      .upsert({ owner_id: user.id, code })

    if (error) {
      showToast('Kod oluşturulurken hata oluştu.', 'error')
      return
    }

    setInviteCode(code)
    showToast('Davet kodu oluşturuldu!', 'success')
  }

  const handleCopyCode = () => {
    if (!inviteCode) return
    navigator.clipboard.writeText(inviteCode)
    showToast('Kod kopyalandı!', 'success')
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)

    const client = createClient()

    const { data: invitation, error: invError } = await client
      .from('invitations')
      .select('owner_id')
      .eq('code', joinCode.trim().toUpperCase())
      .single()

    if (invError || !invitation) {
      showToast('Geçersiz davet kodu.', 'error')
      setJoining(false)
      return
    }

    if (invitation.owner_id === user.id) {
      showToast('Kendi kodunuzu kullanamazsınız.', 'error')
      setJoining(false)
      return
    }

    const { error } = await client
      .from('collaborators')
      .insert({ owner_id: invitation.owner_id, collaborator_id: user.id })

    if (error) {
      if (error.code === '23505') {
        showToast('Zaten bu workspace\'e katıldınız.', 'info')
      } else {
        showToast('Katılırken hata oluştu.', 'error')
      }
      setJoining(false)
      return
    }

    showToast('Workspace\'e başarıyla katıldınız!', 'success')
    setJoinCode('')
    setJoining(false)
    router.refresh()
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('owner_id', user.id)
      .eq('collaborator_id', collaboratorId)

    if (error) {
      showToast('Kaldırılırken hata oluştu.', 'error')
      return
    }

    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
    showToast('Collaborator kaldırıldı.', 'delete')
  }

  const handleLeaveWorkspace = async (ownerId: string) => {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('owner_id', ownerId)
      .eq('collaborator_id', user.id)

    if (error) {
      showToast('Çıkılırken hata oluştu.', 'error')
      return
    }

    setJoinedWorkspaces(prev => prev.filter(w => w.owner_id !== ownerId))
    showToast('Workspace\'ten çıkıldı.', 'delete')
  }

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) return
    if (newPassword !== confirmPassword) {
      showToast('Şifreler eşleşmiyor.', 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast('Şifre en az 6 karakter olmalı.', 'error')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      showToast('Şifre güncellenirken hata oluştu.', 'error')
    } else {
      showToast('Şifre başarıyla güncellendi!', 'success')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatar = user.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            ← Geri
          </button>
          <div className="w-px h-5 bg-[var(--border)]" />
          <Logo size="sm" />
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Avatar & Email */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {avatar}
          </div>
          <div>
  <p className="text-lg font-semibold text-[var(--text-primary)]">
    {user.user_metadata?.full_name || user.email}
  </p>
  <p className="text-sm text-[var(--text-muted)] mt-0.5 break-all">{user.email}</p>
  <p className="text-xs text-[var(--text-muted)] mt-0.5">
    Üye olma: {new Date(user.created_at).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })}
  </p>
</div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Toplam Board" value={boardCount} icon="📋" />
          <StatCard label="Toplam Kart" value={cardCount} icon="🃏" />
        </div>

        {/* Davet Kodu */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Workspace Davet Kodu
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Bu kodu paylaştığın kişiler board&apos;larına erişebilir.
          </p>

          {inviteCode ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-bold tracking-widest text-[var(--accent)]">
                  {inviteCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-[var(--accent)] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Kopyala
              </button>
            </div>
          ) : (
            <div className="mb-4" />
          )}

          <button
            onClick={handleGenerateCode}
            className="w-full border border-[var(--border)] text-[var(--text-secondary)] py-2 rounded-xl text-sm font-medium hover:bg-[var(--border)] transition-colors"
          >
            {inviteCode ? '🔄 Yeni Kod Oluştur' : '✨ Davet Kodu Oluştur'}
          </button>
        </div>

        {/* Collaborator'lar */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Collaborator&apos;lar
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Board&apos;larına erişimi olan kişiler.
          </p>

          {collaborators.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[var(--border)] rounded-xl">
              <p className="text-sm text-[var(--text-muted)]">Henüz collaborator yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map(collab => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between bg-[var(--bg-primary)] rounded-xl px-4 py-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(collab.name || collab.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{collab.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{collab.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCollaborator(collab.id)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Davet Koduyla Katıl */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Workspace&apos;e Katıl
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Bir davet kodu ile başkasının workspace&apos;ine katıl.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Davet kodunu gir..."
              maxLength={6}
              className="flex-1 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] tracking-widest font-mono uppercase"
            />
            <button
              onClick={handleJoin}
              disabled={joining || joinCode.length !== 6}
              className="bg-[var(--accent)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Katılınıyor...' : 'Katıl'}
            </button>
          </div>
        </div>

        {/* Katıldığım Workspace'ler */}
        {joinedWorkspaces.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              Katıldığım Workspace&apos;ler
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Üye olduğun workspace&apos;lerden çıkabilirsin.
            </p>
            <div className="space-y-2">
              {joinedWorkspaces.map(workspace => (
                <div
                  key={workspace.id}
                  className="flex items-center justify-between bg-[var(--bg-primary)] rounded-xl px-4 py-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--text-primary)]">{workspace.name}</span>
                  </div>
                  <button
                    onClick={() => handleLeaveWorkspace(workspace.owner_id)}
                    className="text-xs text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Çık
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Şifre Değiştir */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Şifre Değiştir</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
              className="w-full bg-[var(--accent)] text-white py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </div>

        {/* Çıkış Yap */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Oturumu Kapat</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Hesabından çıkış yaparsın.</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </main>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: number
  icon: string
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  )
}