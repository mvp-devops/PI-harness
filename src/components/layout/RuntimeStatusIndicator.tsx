import { cn } from '@/lib/utils'
import type { RuntimeState } from '@/types'

const STATE_META: Record<RuntimeState, { label: string; dot: string; text: string }> = {
  connected: {
    label: 'Connected',
    dot: 'bg-accent-600 dark:bg-accent-500',
    text: 'text-neutral-600 dark:text-neutral-300',
  },
  disconnected: {
    label: 'Disconnected',
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  },
  reconnecting: {
    label: 'Reconnecting',
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-amber-600 dark:text-amber-400',
  },
}

/** Compact connection indicator: colored dot + text (never color alone). */
export function RuntimeStatusIndicator({ state, className }: { state: RuntimeState; className?: string }) {
  const meta = STATE_META[state]
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-medium', meta.text, className)}>
      <span className={cn('size-2 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
