import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const STORAGE_KEY = 'pi-harness-theme'

function loadPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    /* storage unavailable — fall back to system */
  }
  return 'system'
}

/** UI state for the color theme preference (Light / Dark / System). */
export const useThemeStore = create<ThemeState>((set) => ({
  preference: loadPreference(),
  setPreference: (preference) => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* ignore */
    }
    set({ preference })
  },
}))

/** Resolve the "system" preference to a concrete theme. */
export function resolveSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
