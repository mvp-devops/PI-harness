import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

/**
 * Three-zone shell: fixed sidebar (collapsible on mobile), scrollable content.
 * The right panel is a Job-details-only concern and lives on that screen.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <button
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Pi Harness</span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-neutral-950/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <button
              className="absolute top-4 right-3 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white lg:block',
          'dark:border-neutral-800 dark:bg-neutral-900',
        )}
      >
        <Sidebar />
      </aside>

      {/* Content */}
      <main className="px-4 py-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
