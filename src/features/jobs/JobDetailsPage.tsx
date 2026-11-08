import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobMetaPanel } from '@/components/jobs/JobMetaPanel'
import { PageHeader } from '@/components/layout'
import { LogViewer } from '@/components/logs/LogViewer'
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ProgressBar,
  Spinner,
  StatusBadge,
  TabPanel,
  Tabs,
} from '@/components/ui'
import { useArtifacts, useJob, useLogs, useTasks } from '@/lib/api/hooks'
import { cn, formatDateTime, formatDuration, TASK_STATUS_CLASS, TASK_STATUS_LABEL } from '@/lib/utils'
import { ChevronRight, FileBox } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'logs', label: 'Logs' },
  { id: 'artifacts', label: 'Artifacts' },
]

function OverviewTab({ jobId }: { jobId: string }) {
  const { data: job } = useJob(jobId)
  if (!job) return null
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="px-5">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Requirement</h3>
        </CardHeader>
        <CardBody className="text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
          {job.requirement}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="px-5">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Plan</h3>
        </CardHeader>
        <CardBody>
          <ol className="space-y-2">
            {job.plan.map((step, i) => (
              <li key={step.id} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-xs font-medium',
                    TASK_STATUS_CLASS[step.status],
                  )}
                >
                  {TASK_STATUS_LABEL[step.status]}
                </span>
                <span className={cn(step.status === 'done' && 'text-neutral-400 line-through dark:text-neutral-500')}>
                  {i + 1}. {step.title}
                </span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="px-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Timing</h3>
          </CardHeader>
          <CardBody className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
            <p>Started: {formatDateTime(job.startedAt)}</p>
            <p>Updated: {formatDateTime(job.updatedAt)}</p>
            <p>Finished: {formatDateTime(job.finishedAt)}</p>
            <p>Duration: {formatDuration(job.startedAt, job.finishedAt)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="px-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Runtime</h3>
          </CardHeader>
          <CardBody className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
            <p>Model: <span className="font-mono text-xs">{job.model}</span></p>
            <p>Agent profile: {job.agentProfile}</p>
            <p>Mode: {job.mode}</p>
            <p>Current step: {job.currentStep ?? '—'}</p>
          </CardBody>
        </Card>
      </div>

      {job.error && (
        <Card className="border-red-200 dark:border-red-900">
          <CardBody className="text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">Error:</span> {job.error}
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function TasksTab({ jobId }: { jobId: string }) {
  const { data: tasks, isLoading } = useTasks(jobId)
  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="size-6" /></div>
  }
  if (!tasks || tasks.length === 0) {
    return <EmptyState title="Подзадач нет" description="Для этого job пока не создано подзадач." />
  }
  return (
    <Card>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-5 py-3">
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border',
                task.status === 'done'
                  ? 'border-accent-700 bg-accent-700 text-white dark:border-accent-600 dark:bg-accent-600'
                  : 'border-neutral-300 dark:border-neutral-600',
              )}
              aria-hidden="true"
            >
              {task.status === 'done' && (
                <svg viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 5.5 4 7.5 8 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm', task.status === 'done' ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100')}>
                {task.title}
              </p>
              {task.blockedReason && <p className="text-xs text-amber-600 dark:text-amber-400">{task.blockedReason}</p>}
            </div>
            <span className="hidden text-xs text-neutral-400 sm:inline">{task.assignee}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium',
                TASK_STATUS_CLASS[task.status],
              )}
            >
              {TASK_STATUS_LABEL[task.status]}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function LogsTab({ jobId }: { jobId: string }) {
  const { data: logs, isLoading } = useLogs(jobId)
  return <LogViewer logs={logs} isLoading={isLoading} className="h-[28rem]" />
}

function ArtifactsTab({ jobId }: { jobId: string }) {
  const { data: artifacts, isLoading } = useArtifacts(jobId)
  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="size-6" /></div>
  }
  if (!artifacts || artifacts.length === 0) {
    return (
      <EmptyState
        icon={<FileBox className="size-10" />}
        title="Артефактов пока нет"
        description="Файлы, созданные или изменённые задачей, появятся здесь."
      />
    )
  }
  return (
    <Card>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {artifacts.map((a) => (
          <li key={a.id} className="flex items-center gap-3 px-5 py-3">
            <FileBox className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-700 dark:text-neutral-300">
              {a.path}
            </span>
            <span className="text-xs text-neutral-400">{a.change}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium',
                a.status === 'ok'
                  ? TASK_STATUS_CLASS.done
                  : a.status === 'failed'
                    ? TASK_STATUS_CLASS.failed
                    : TASK_STATUS_CLASS.pending,
              )}
            >
              {a.status}
            </span>
            <button
              className="rounded-lg px-2 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/40"
              onClick={() => window.alert(`Opening ${a.path} in editor (stub)`)}
              aria-label={`Open ${a.path} in editor`}
            >
              Open in editor
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState('overview')
  const { data: job, isLoading, isError } = useJob(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !job) {
    return (
      <EmptyState
        title="Job не найден"
        description={`Задача ${id} не существует или была удалена.`}
        action={<Link to="/jobs" className="text-sm font-medium text-accent-700 hover:underline dark:text-accent-400">← К списку jobs</Link>}
      />
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-neutral-400">
            <Link to="/jobs" className="hover:text-neutral-600 dark:hover:text-neutral-300">Jobs</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="font-mono">{job.id}</span>
          </nav>
        }
        title={job.requirement}
        actions={<StatusBadge status={job.status} />}
      />

      <div className="mb-6">
        <ProgressBar value={job.progress} ariaLabel={`Job progress ${job.id}`} />
        <p className="mt-1 text-xs text-neutral-400">{Math.round(job.progress)}% · обновлено {formatDateTime(job.updatedAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <Tabs items={TABS} active={tab} onChange={setTab} ariaLabel="Job sections" className="mb-4" />
          <TabPanel id="overview" active={tab}>
            <OverviewTab jobId={job.id} />
          </TabPanel>
          <TabPanel id="tasks" active={tab}>
            <TasksTab jobId={job.id} />
          </TabPanel>
          <TabPanel id="logs" active={tab}>
            <LogsTab jobId={job.id} />
          </TabPanel>
          <TabPanel id="artifacts" active={tab}>
            <ArtifactsTab jobId={job.id} />
          </TabPanel>
        </div>

        <JobMetaPanel job={job} />
      </div>
    </div>
  )
}
