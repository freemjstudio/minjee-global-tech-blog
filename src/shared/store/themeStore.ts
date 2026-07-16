import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
    }),
    { name: 'theme' },
  ),
)

export function initTheme() {
  const stored = localStorage.getItem('theme')
  const theme: Theme = stored ? JSON.parse(stored).state?.theme ?? 'light' : 'light'
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
