import { Priority } from '@/types'

type Props = {
  priority?: Priority
  size?: 'sm' | 'md'
}

const config: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  low: {
    label: 'Düşük',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    dot: 'bg-green-500',
  },
  medium: {
    label: 'Orta',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    dot: 'bg-yellow-500',
  },
  high: {
    label: 'Yüksek',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    dot: 'bg-red-500',
  },
}

export default function PriorityBadge({ priority, size = 'sm' }: Props) {
  if (!priority) return null

  const { label, color, bg, dot } = config[priority]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {size === 'md' && label}
    </span>
  )
}