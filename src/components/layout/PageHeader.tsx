import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: string
  actions?: ReactNode
  breadcrumbs?: ReactNode
  className?: string
}

/** Section heading area: breadcrumbs, title, description, action buttons. */
export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {breadcrumbs && <div className="mb-1">{breadcrumbs}</div>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
