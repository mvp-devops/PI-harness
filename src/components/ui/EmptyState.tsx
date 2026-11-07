import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('size-4 animate-spin text-neutral-400', className)} aria-label="Loading" />
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Friendly empty state: short explanation plus a primary action. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-700',
        className,
      )}
    >
      {icon && <div className="mb-1 text-neutral-300 dark:text-neutral-600">{icon}</div>}
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {description && <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
