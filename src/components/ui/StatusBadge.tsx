import { cn, JOB_STATUS_CLASS, JOB_STATUS_LABEL, TASK_STATUS_CLASS, TASK_STATUS_LABEL } from '@/lib/utils'
import type { JobStatus, TaskStatus } from '@/types'
import {
  Circle,
  CircleCheck,
  CirclePause,
  CircleStop,
  Clock,
  Hourglass,
  LoaderCircle,
  PlayCircle,
  TriangleAlert,
  XCircle,
} from 'lucide-react'

type BadgeKind =
  | { kind: 'job'; status: JobStatus }
  | { kind: 'task'; status: TaskStatus }

/** Icon makes the status distinguishable without relying on color alone. */
function statusIcon(kind: BadgeKind) {
  const cls = 'size-3.5 shrink-0'
  if (kind.kind === 'job') {
    switch (kind.status) {
      case 'running':
        return <LoaderCircle className={cn(cls, 'animate-spin')} />
      case 'queued':
        return <Clock className={cls} />
      case 'paused':
        return <CirclePause className={cls} />
      case 'waiting_approval':
        return <Hourglass className={cls} />
      case 'completed':
        return <CircleCheck className={cls} />
      case 'failed':
        return <XCircle className={cls} />
      case 'cancelled':
        return <CircleStop className={cls} />
      case 'draft':
        return <PlayCircle className={cls} />
    }
  }
  switch (kind.status) {
    case 'pending':
      return <Circle className={cls} />
    case 'in_progress':
      return <LoaderCircle className={cn(cls, 'animate-spin')} />
    case 'blocked':
      return <TriangleAlert className={cls} />
    case 'done':
      return <CircleCheck className={cls} />
    case 'failed':
      return <XCircle className={cls} />
  }
}

/** Status badge with color + icon + text so states never rely on color alone. */
export function StatusBadge({ status, kind = 'job' }: { status: JobStatus | TaskStatus; kind?: 'job' | 'task' }) {
  const isJob = kind === 'job'
  const cls = isJob
    ? JOB_STATUS_CLASS[status as JobStatus]
    : TASK_STATUS_CLASS[status as TaskStatus]
  const label = isJob
    ? JOB_STATUS_LABEL[status as JobStatus]
    : TASK_STATUS_LABEL[status as TaskStatus]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        cls,
      )}
    >
      {statusIcon({ kind: isJob ? 'job' : 'task', status } as BadgeKind)}
      {label}
    </span>
  )
}
