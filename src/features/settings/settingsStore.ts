import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemePreference } from './themeStore'

interface SettingsState {
  /** Pi runtime endpoint, edited on the Settings screen. */
  url: string
  /** Access token. Never persisted in plain text — see `tokenRemembered`. */
  token: string
  tokenRemembered: boolean
  theme: ThemePreference
  autoscrollLogs: boolean
  confirmDestructive: boolean
  setUrl: (url: string) => void
  setToken: (token: string, remember: boolean) => void
  setTheme: (theme: ThemePreference) => void
  setAutoscroll: (on: boolean) => void
  setConfirmDestructive: (on: boolean) => void
}

/**
 * User preferences. The token is intentionally NOT persisted to storage:
 * only the fact that the user chose to keep it for the session is stored.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      url: 'wss://pi.dev/rpc',
      token: '',
      tokenRemembered: false,
      theme: 'system',
      autoscrollLogs: true,
      confirmDestructive: true,
      setUrl: (url) => set({ url }),
      setToken: (token, remember) => set({ token, tokenRemembered: remember }),
      setTheme: (theme) => set({ theme }),
      setAutoscroll: (autoscrollLogs) => set({ autoscrollLogs }),
      setConfirmDestructive: (confirmDestructive) => set({ confirmDestructive }),
    }),
    {
      name: 'pi-harness-settings',
      partialize: (s) => ({
        url: s.url,
        token: s.tokenRemembered ? s.token : '',
        tokenRemembered: s.tokenRemembered,
        theme: s.theme,
        autoscrollLogs: s.autoscrollLogs,
        confirmDestructive: s.confirmDestructive,
      }),
    },
  ),
)
