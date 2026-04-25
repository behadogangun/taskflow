export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header skeleton */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="h-7 w-32 bg-[var(--border)] rounded-lg animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-[var(--border)] rounded animate-pulse" />
          <div className="h-8 w-8 bg-[var(--border)] rounded-lg animate-pulse" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Başlık skeleton */}
        <div className="h-8 w-48 bg-[var(--border)] rounded-lg animate-pulse mb-8" />

        {/* Input skeleton */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 mb-6 flex gap-3">
          <div className="flex-1 h-9 bg-[var(--border)] rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-[var(--border)] rounded-lg animate-pulse" />
        </div>

        {/* Board kartları skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-2 w-full bg-[var(--border)] animate-pulse" />
              <div className="p-5">
                <div className="h-5 w-3/4 bg-[var(--border)] rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-[var(--border)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}