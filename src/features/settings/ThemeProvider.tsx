import { useEffect } from 'react'
import { resolveSystemTheme, useThemeStore } from './themeStore'

/**
 * Applies the theme preference to <html> and follows OS changes
 * while the "system" preference is selected.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useThemeStore((s) => s.preference)

  useEffect(() => {
    const apply = () => {
      const resolved = preference === 'system' ? resolveSystemTheme() : preference
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      document.documentElement.style.colorScheme = resolved
    }
    apply()
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [preference])

  return <>{children}</>
}
