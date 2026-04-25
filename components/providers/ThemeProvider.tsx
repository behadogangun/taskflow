'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

 useEffect(() => {
  const saved = localStorage.getItem('theme') as Theme | null
  const preferred: Theme = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', preferred === 'dark')
  setTimeout(() => {
    setTheme(preferred)
    setMounted(true)
  }, 0)
}, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [theme])

  // Flash önlemek için tema yüklenene kadar içeriği gizle
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}