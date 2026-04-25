export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header skeleton */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-[var(--border)] rounded animate-pulse" />
          <div className="w-px h-5 bg-[var(--border)]" />
          <div className="h-5 w-32 bg-[var(--border)] rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 bg-[var(--border)] rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-[var(--border)] rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Kanban skeleton */}
      <div className="p-6 flex flex-wrap gap-4">
        {[...Array(3)].map((_, colIndex) => (
          <div
            key={colIndex}
            className="w-72 bg-[var(--bg-surface)] rounded-xl p-3"
            style={{ animationDelay: `${colIndex * 100}ms` }}
          >
            {/* Sütun başlığı */}
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-[var(--border)] rounded animate-pulse" />
              <div className="h-5 w-5 bg-[var(--border)] rounded-full animate-pulse" />
            </div>

            {/* Kart skeleton'ları */}
            <div className="space-y-2">
              {[...Array(colIndex + 2)].map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]"
                >
                  <div className="h-3 w-16 bg-[var(--border)] rounded-full animate-pulse mb-2" />
                  <div className="h-4 w-full bg-[var(--border)] rounded animate-pulse mb-1" />
                  <div className="h-3 w-2/3 bg-[var(--border)] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}