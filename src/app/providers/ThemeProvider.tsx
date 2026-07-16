import { useEffect, type ReactNode } from 'react'
import { initTheme } from '@/shared/store/themeStore'

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => { initTheme() }, [])
  return <>{children}</>
}
