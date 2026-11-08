import { useEffect, useState } from 'react'
import { JobActions } from '@/components/jobs/JobActions'
import { Card, CardHeader, StatusBadge } from '@/components/ui'
import { harnessApi } from '@/lib/api'
import { formatDateTime, formatDuration } from '@/lib/utils'
import type { Job, JobEvent } from '@/types'

/** Compact rendering of a single event for the right panel feed. */
function EventLine({ event }: { event: JobEvent }) {
  const time = new Date(event.ts).toLocaleTimeString()
  let text: string
  switch (event.type) {
    case 'status':
      text = `status → ${event.status.replace('_', ' ')}`
      break
    case 'progress':
      text = `progress ${Math.round(event.progress)}%`
      break
    case 'log':
      text = `log [${event.entry.level}] ${event.entry.message}`
      break
    case 'task':
      text = `task "${event.task.title}" → ${event.task.status.replace('_', ' ')}`
      break
  }
  return (
    <li className="font-mono text-xs">
      <span className="text-neutral-400">{time}</span>{' '}
      <span className="text-neutral-600 dark:text-neutral-300">{text}</span>
    </li>
  )
}

/**
 * Job-details-only right panel: metadata, quick actions and a live event feed.
 */
export function JobMetaPanel({ job }: { job: Job }) {
  const [events, setEvents] = useState<JobEvent[]>([])

  useEffect(() => {
    setEvents([])
    const subscription = harnessApi.subscribeToJobEvents(job.id, (event) => {
      setEvents((prev) => [...prev.slice(-7), event])
    })
    return () => subscription.unsubscribe()
  }, [job.id])

  const rows: Array<[string, React.ReactNode]> = [
    ['ID', <span key="id" className="font-mono text-xs">{job.id}</span>],
    ['Status', <StatusBadge key="status" status={job.status} />],
    ['Model', <span key="model" className="font-mono text-xs">{job.model}</span>],
    ['Agent', job.agentProfile],
    ['Mode', job.mode],
    ['Approval required', job.requireApproval ? 'yes' : 'no'],
    ['Created', formatDateTime(job.createdAt)],
    ['Updated', formatDateTime(job.updatedAt)],
    ['Duration', formatDuration(job.startedAt, job.finishedAt)],
  ]

  return (
    <aside className="space-y-4" aria-label="Job metadata and actions">
      <Card>
        <CardHeader className="px-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick actions</h2>
        </CardHeader>
        <div className="p-4">
          <JobActions job={job} variant="labels" />
        </div>
      </Card>

      <Card>
        <CardHeader className="px-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Metadata</h2>
        </CardHeader>
        <dl className="space-y-2 p-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs text-neutral-400">{label}</dt>
              <dd className="min-w-0 truncate text-right text-neutral-700 dark:text-neutral-300">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader className="px-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent events</h2>
        </CardHeader>
        <div className="p-4">
          {events.length === 0 ? (
            <p className="text-xs text-neutral-400">Ожидаю события из потока…</p>
          ) : (
            <ul className="space-y-1.5">
              {events.map((e, i) => (
                <EventLine key={`${e.ts}-${i}`} event={e} />
              ))}
            </ul>
          )}
        </div>
      </Card>
    </aside>
  )
}
