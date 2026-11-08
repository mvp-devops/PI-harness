import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { useJobAction, type JobAction as ActionId } from '@/lib/api/useJobAction'
import { useSettingsStore } from '@/features/settings/settingsStore'
import type { Job } from '@/types'
import { CirclePause, CirclePlay, RotateCcw, XCircle } from 'lucide-react'

interface ActionDef {
  id: ActionId
  label: string
  icon: React.ReactNode
  /** Whether the action must be confirmed before it runs. */
  destructive: boolean
  enabled: (job: Job) => boolean
}

const ACTIONS: ActionDef[] = [
  {
    id: 'resumeJob',
    label: 'Resume',
    icon: <CirclePlay className="size-4" />,
    destructive: false,
    enabled: (job) => job.status === 'paused',
  },
  {
    id: 'pauseJob',
    label: 'Pause',
    icon: <CirclePause className="size-4" />,
    destructive: false,
    enabled: (job) => job.status === 'running' || job.status === 'queued',
  },
  {
    id: 'retryJob',
    label: 'Retry',
    icon: <RotateCcw className="size-4" />,
    destructive: true,
    enabled: (job) => job.status === 'failed' || job.status === 'cancelled',
  },
  {
    id: 'cancelJob',
    label: 'Cancel',
    icon: <XCircle className="size-4" />,
    destructive: true,
    enabled: (job) => !['completed', 'failed', 'cancelled', 'draft'].includes(job.status),
  },
]

interface JobActionsProps {
  job: Job
  size?: 'sm' | 'md'
  /** Compact icon-only row buttons or labelled panel buttons. */
  variant?: 'icons' | 'labels'
}

/**
 * Job control buttons (Pause/Resume/Cancel/Retry) with optional confirmation.
 * Honors the "Confirm before destructive actions" setting.
 */
export function JobActions({ job, size = 'sm', variant = 'icons' }: JobActionsProps) {
  const [pending, setPending] = useState<ActionDef | null>(null)
  const runAction = useJobAction()
  const confirmDestructive = useSettingsStore((s) => s.confirmDestructive)

  const available = ACTIONS.filter((a) => a.enabled(job))

  const execute = (action: ActionDef) => {
    setPending(null)
    runAction.mutate({ action: action.id, id: job.id })
  }

  const start = (action: ActionDef) => {
    if (action.destructive && confirmDestructive) {
      setPending(action)
      return
    }
    if (action.destructive) {
      // Confirmation disabled in settings — destructive actions still notify.
      execute(action)
      return
    }
    execute(action)
  }

  return (
    <>
      <div className="flex items-center gap-1" role="group" aria-label={`Actions for ${job.id}`}>
        {available.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size={size}
            onClick={() => start(action)}
            disabled={runAction.isPending}
            aria-label={`${action.label} job ${job.id}`}
            title={action.label}
            className={variant === 'labels' ? 'px-3' : 'px-2'}
          >
            {action.icon}
            {variant === 'labels' && <span>{action.label}</span>}
          </Button>
        ))}
        {available.length === 0 && <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>}
      </div>

      <Modal
        open={pending !== null}
        title={`Confirm ${pending?.label.toLowerCase() ?? ''}`}
        description={
          pending
            ? `Job «${job.requirement.slice(0, 80)}» (${job.id}) will be ${pending.id === 'cancelJob' ? 'cancelled' : 're-queued from the beginning'}. This action cannot be undone.`
            : ''
        }
        confirmLabel={pending?.label}
        destructive={pending?.destructive}
        onConfirm={() => pending && execute(pending)}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
