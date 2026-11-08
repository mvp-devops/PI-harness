import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobs, useTasks } from '@/lib/api/hooks'
import { PageHeader } from '@/components/layout'
import { Card, EmptyState, Select, Spinner, StatusBadge } from '@/components/ui'
import { formatRelative, TASK_STATUS_LABEL } from '@/lib/utils'
import type { TaskStatus } from '@/types'

const FILTERS: Array<TaskStatus | 'all'> = ['all', 'pending', 'in_progress', 'blocked', 'done', 'failed']

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks()
  const { data: jobsData } = useJobs({ pageSize: 100 })
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const jobTitles = useMemo(() => {
    const map = new Map<string, { requirement: string }>()
    for (const job of jobsData?.items ?? []) map.set(job.id, { requirement: job.requirement })
    return map
  }, [jobsData])

  const filtered = useMemo(
    () => (tasks ?? []).filter((t) => filter === 'all' || t.status === filter),
    [tasks, filter],
  )

  // Filter chip counts for the "All / Pending / …" selector.
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tasks ?? []) map.set(t.status, (map.get(t.status) ?? 0) + 1)
    return map
  }, [tasks])

  return (
    <div>
      <PageHeader title="Tasks" description="Подзадачи всех jobs в одном списке." />

      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter tasks by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors ' +
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700 ' +
              (filter === f
                ? 'border-accent-700 bg-accent-700 text-white dark:border-accent-600 dark:bg-accent-600'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800')
            }
          >
            {f === 'all' ? 'All' : TASK_STATUS_LABEL[f]}
            {f !== 'all' && counts.get(f) ? <span className="ml-1 opacity-70">{counts.get(f)}</span> : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="size-6" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Задач нет"
          description={filter === 'all' ? 'Подзадачи появятся, когда jobs начнут работу.' : 'В этом статусе задач нет.'}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <th className="px-4 py-2.5 font-medium">Task</th>
                  <th className="px-4 py-2.5 font-medium">Job</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Assignee</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Updated</th>
                  <th className="px-4 py-2.5 text-right font-medium">Job link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filtered.map((task) => (
                  <tr key={task.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                    <td className="max-w-72 px-4 py-3">
                      <span className="block truncate text-neutral-900 dark:text-neutral-100">{task.title}</span>
                      {task.blockedReason && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">{task.blockedReason}</span>
                      )}
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <span className="block truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {task.jobId}
                      </span>
                      <span className="block truncate text-xs text-neutral-400">
                        {jobTitles.get(task.jobId)?.requirement ?? ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} kind="task" />
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 md:table-cell dark:text-neutral-400">
                      {task.assignee}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell dark:text-neutral-400">
                      {formatRelative(task.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/jobs/${task.jobId}`}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/40"
                        aria-label={`Open job ${task.jobId}`}
                      >
                        Open job
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
