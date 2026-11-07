import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  active: string
  onChange: (id: string) => void
  ariaLabel?: string
}

export function Tabs({ items, active, onChange, ariaLabel }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 border-b border-neutral-200 dark:border-neutral-700"
    >
      {items.map((item) => {
        const selected = item.id === active
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-700',
              selected
                ? 'border-accent-700 text-neutral-900 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null
  return (
    <div role="tabpanel" aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  )
}
