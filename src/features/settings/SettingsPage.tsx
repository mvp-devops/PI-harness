import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button, Card, CardBody, CardHeader, Checkbox, Input, Select, toast } from '@/components/ui'
import { useSettingsStore } from './settingsStore'
import { useThemeStore, type ThemePreference } from './themeStore'
import { KeyRound, PlugZap, ShieldAlert } from 'lucide-react'

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export default function SettingsPage() {
  const settings = useSettingsStore()
  const { preference, setPreference } = useThemeStore()
  const [url, setUrl] = useState(settings.url)
  const [token, setToken] = useState('')
  const [rememberToken, setRememberToken] = useState(false)
  const [testing, setTesting] = useState(false)

  const testConnection = async () => {
    if (!url.trim()) {
      toast('error', 'Укажите URL подключения к Pi runtime')
      return
    }
    setTesting(true)
    // Mock probe: real backend will replace this via the API layer.
    await new Promise((r) => setTimeout(r, 800))
    setTesting(false)
    toast('success', `Соединение с ${url} успешно (mock)`)
  }

  const saveToken = () => {
    settings.setToken(token, rememberToken)
    toast(
      'success',
      rememberToken ? 'Token сохранён для этой сессии' : 'Token применён (не сохраняется после закрытия)',
    )
    setToken('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Подключение, тема и поведение интерфейса." />

      <Card>
        <CardHeader className="px-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <PlugZap className="size-4 text-neutral-400" aria-hidden="true" /> Подключение к Pi runtime
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label htmlFor="runtime-url" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              URL
            </label>
            <Input
              id="runtime-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="wss://pi.dev/rpc"
              className="font-mono"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={testConnection} disabled={testing}>
              {testing ? 'Testing…' : 'Test connection'}
            </Button>
          </div>

          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <label htmlFor="runtime-token" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <KeyRound className="size-3.5 text-neutral-400" aria-hidden="true" /> Token
            </label>
            <Input
              id="runtime-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={settings.tokenRemembered ? '•••••••• (сохранён)' : 'Вставьте токен доступа'}
              autoComplete="off"
            />
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
              <span className="flex items-start gap-1.5">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Токен не хранится в localStorage в открытом виде. Для постоянного использования предпочитайте
                  безопасное хранение на стороне ОС (keychain) или переменные окружения backend-прокси.
                </span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <Checkbox
                checked={rememberToken}
                onCheckedChange={setRememberToken}
                label="Помнить в этой сессии (persist)"
              />
              <Button variant="secondary" size="sm" onClick={saveToken} disabled={!token.trim()}>
                Save token
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="px-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Тема</h2>
        </CardHeader>
        <CardBody>
          <Select
            value={preference}
            onChange={(e) => {
              const v = e.target.value as ThemePreference
              setPreference(v)
              settings.setTheme(v)
            }}
            aria-label="Theme preference"
            className="w-40"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="px-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Поведение</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <Checkbox
            checked={settings.autoscrollLogs}
            onCheckedChange={settings.setAutoscroll}
            label="Автоскролл логов"
          />
          <Checkbox
            checked={settings.confirmDestructive}
            onCheckedChange={settings.setConfirmDestructive}
            label="Подтверждать опасные действия (Cancel, Retry, Disconnect)"
          />
        </CardBody>
      </Card>
    </div>
  )
}
