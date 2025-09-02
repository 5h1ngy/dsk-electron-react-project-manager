import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
      toggle: () => {
        const current = get().mode
        set({ mode: current === 'light' ? 'dark' : 'light' })
      }
    }),
    {
      name: 'theme-store',
      version: 1
    }
  )
)
