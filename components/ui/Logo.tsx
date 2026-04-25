import Link from 'next/link'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizes = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 28, text: 'text-xl' },
  lg: { icon: 36, text: 'text-2xl' },
}

export default function Logo({ size = 'md', href = '/dashboard' }: Props) {
  const { icon, text } = sizes[size]

  const content = (
    <div className="flex items-center gap-2">
      {/* Logo ikonu */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="28" height="28" rx="8" fill="var(--accent)" />
        <rect x="6" y="8" width="5" height="12" rx="2" fill="white" opacity="0.9" />
        <rect x="13" y="6" width="5" height="16" rx="2" fill="white" />
        <rect x="20" y="10" width="5" height="10" rx="2" fill="white" opacity="0.7" />
      </svg>
      <span className={`${text} font-bold text-[var(--accent)]`}>
        TaskFlow
      </span>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}