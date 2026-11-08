import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JobActions } from '@/components/jobs/JobActions'
import { PageHeader } from '@/components/layout'
import {
  Button,
  Card,
  EmptyState,
  Input,
  ProgressBar,
  Select,
  Spinner,
  StatusBadge,
} from '@/components/ui'
import { useJobs } from '@/lib/api/hooks'
import { cn, formatDateTime, formatDuration, JOB_STATUS_LABEL } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import type { JobFilters, JobStatus } from '@/types'

const PAGE_SIZE = 10

const STATUS_OPTIONS: Array<JobStatus | 'all'> = [
  'all',
  'draft',
  'queued',
  'running',
  'paused',
  'waiting_approval',
  'completed',
  'failed',
  'cancelled',
]

export default function JobsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<JobStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const filters: JobFilters = { search: search || undefined, status, page, pageSize: PAGE_SIZE }
  const { data, isLoading, isFetching } = useJobs(filters)
  const jobs = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Все задачи harness: запуск, контроль и остановка."
        actions={
          <Button onClick={() => navigate('/jobs/new')}>
            <Plus className="size-4" /> New job
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Поиск по названию или ID…"
            aria-label="Search jobs"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as JobStatus | 'all')
            setPage(1)
          }}
          aria-label="Filter by status"
          className="w-48"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : JOB_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="size-6" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="Задачи не найдены"
          description={
            search || status !== 'all'
              ? 'Попробуйте изменить фильтры или поисковый запрос.'
              : 'Запустите первую задачу, чтобы увидеть её здесь.'
          }
          action={
            <Button onClick={() => navigate('/jobs/new')}>
              <Plus className="size-4" /> New job
            </Button>
          }
        />
      ) : (
        <Card className={cn('overflow-hidden', isFetching && 'opacity-80 transition-opacity')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <th className="px-4 py-2.5 font-medium">Job ID</th>
                  <th className="px-4 py-2.5 font-medium">Requirement</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Progress</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Agent / model</th>
                  <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Started</th>
                  <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Duration</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">{job.id}</td>
                    <td className="max-w-64 px-4 py-3">
                      <span className="block truncate text-neutral-900 dark:text-neutral-100">{job.requirement}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="w-36 px-4 py-3">
                      <ProgressBar value={job.progress} ariaLabel={`Progress ${job.id}`} />
                      <span className="mt-1 block text-xs text-neutral-400">{Math.round(job.progress)}%</span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell dark:text-neutral-400">
                      {job.agentProfile} / <span className="font-mono">{job.model}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 xl:table-cell dark:text-neutral-400">
                      {formatDateTime(job.startedAt)}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-neutral-500 xl:table-cell dark:text-neutral-400">
                      {formatDuration(job.startedAt, job.finishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                        role="presentation"
                      >
                        <JobActions job={job} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Всего {total} · страница {page} из {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
