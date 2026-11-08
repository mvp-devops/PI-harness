import { useNavigate } from 'react-router-dom'
import { useJobs, useTasks } from '@/lib/api/hooks'
import { CircleQuestionMark, ListTodo, PlayCircle, Plus, XCircle } from 'lucide-react'
import { Button, Card, EmptyState, ProgressBar, Spinner, StatusBadge } from '@/components/ui'
import { PageHeader } from '@/components/layout'
import { formatDateTime, isJobActive } from '@/lib/utils'
import type { Job, Task } from '@/types'

interface Stat {
  label: string
  value: number
  icon: React.ReactNode
  to: string
}

/** Four headline counters required by the spec. */
function StatCards({ jobs, tasks }: { jobs: Job[]; tasks: Task[] }) {
  const navigate = useNavigate()
  const active = jobs.filter((j) => isJobActive(j.status)).length
  const queued = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length
  const failed = tasks.filter((t) => t.status === 'failed').length
  const waitingApproval = jobs.filter((j) => j.status === 'waiting_approval').length

  const stats: Stat[] = [
    { label: 'Active jobs', value: active, icon: <PlayCircle className="size-4" />, to: '/jobs' },
    { label: 'Queued tasks', value: queued, icon: <ListTodo className="size-4" />, to: '/tasks' },
    { label: 'Failed tasks', value: failed, icon: <XCircle className="size-4" />, to: '/tasks' },
    { label: 'Requires approval', value: waitingApproval, icon: <CircleQuestionMark className="size-4" />, to: '/jobs' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((s) => (
        <button
          key={s.label}
          onClick={() => navigate(s.to)}
          className="rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
        >
          <Card className="px-4 py-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-600">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              {s.icon}
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{s.value}</p>
          </Card>
        </button>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useJobs({ pageSize: 100 })
  const { data: tasks } = useTasks()
  const jobs = data?.items ?? []

  const recent = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const hasActive = jobs.some((j) => isJobActive(j.status))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Сводка по работе Pi harness."
        actions={
          <Button onClick={() => navigate('/jobs/new')}>
            <Plus className="size-4" /> New job
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="space-y-6">
          <StatCards jobs={jobs} tasks={tasks ?? []} />

          <section>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent jobs</h2>
            {recent.length === 0 ? (
              <EmptyState
                title="Пока нет ни одной задачи"
                description="Запустите первую задачу harness — она появится здесь и в списке Jobs."
                action={
                  <Button onClick={() => navigate('/jobs/new')}>
                    <Plus className="size-4" /> Запустить первую задачу
                  </Button>
                }
              />
            ) : (
              <Card>
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {recent.map((job) => (
                    <li key={job.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {job.requirement}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-neutral-400">{job.id}</p>
                      </div>
                      <div className="hidden w-40 sm:block">
                        <ProgressBar value={job.progress} ariaLabel={`Progress ${job.id}`} />
                        <p className="mt-1 text-right text-xs text-neutral-400">{Math.round(job.progress)}%</p>
                      </div>
                      <StatusBadge status={job.status} />
                      <span className="hidden text-xs text-neutral-400 md:inline">{formatDateTime(job.createdAt)}</span>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                        Open
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {!hasActive && recent.length > 0 && (
            <p className="text-center text-sm text-neutral-400">
              Нет активных задач. Самое время запустить новую.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
