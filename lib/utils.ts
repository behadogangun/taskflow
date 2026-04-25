/**
 * İki pozisyon değeri arasında yeni bir pozisyon hesaplar.
 */
export function getPositionBetween(before: number, after: number): number {
  return (before + after) / 2
}

/**
 * Listenin sonuna eklenecek yeni pozisyon değerini döner.
 */
export function getNextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 1000
  return items[items.length - 1].position + 1000
}

/**
 * Tarihi Türkçe formatında gösterir.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}