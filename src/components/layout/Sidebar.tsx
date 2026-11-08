import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useRuntimeStatus } from '@/lib/api/useRuntimeStatus'
import { RuntimeStatusIndicator } from './RuntimeStatusIndicator'
import {
  Briefcase,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'Jobs', icon: Briefcase, end: false },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, end: false },
  { to: '/logs', label: 'Logs', icon: ScrollText, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

interface SidebarProps {
  onNavigate?: () => void
}

/** Left navigation column: logo, sections, runtime connection state. */
export function Sidebar({ onNavigate }: SidebarProps) {
  const { data: runtime } = useRuntimeStatus()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-700 text-white dark:bg-accent-600">
          <Zap className="size-4" aria-hidden="true" />
        </span>
        <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
          Pi Harness
        </span>
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700',
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <RuntimeStatusIndicator state={runtime?.state ?? 'reconnecting'} />
      </div>
    </div>
  )
}
