import type { HarnessApi } from '@/lib/api/contract'
import type {
  Artifact,
  Job,
  JobEvent,
  JobEventListener,
  JobFilters,
  LogEntry,
  LogFilters,
  RuntimeStatus,
  Task,
} from '@/types'
import { buildMockJobs, makeArtifacts, makeLogs, makeTasks, pick } from './data'

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const LATENCY = 200 + Math.random() * 300

/**
 * In-memory mock implementation of the HarnessApi contract.
 *
 * Active jobs advance on a background tick: progress grows, log lines stream,
 * sub-tasks flip status and jobs eventually complete (or occasionally fail /
 * request approval). Everything the UI sees flows through job events, the same
 * shape a WebSocket/SSE backend would deliver.
 */
class MockHarnessApi implements HarnessApi {
  private jobs: Job[] = buildMockJobs()
  private tasks: Task[] = []
  private logs: LogEntry[] = []
  private artifacts: Artifact[] = []
  private listeners = new Map<string, Set<JobEventListener>>() // key: jobId | 'all'
  private runtime: RuntimeStatus = { state: 'connected', url: 'wss://pi.dev/rpc', version: '1.4.2' }
  private timer: number | null = null

  constructor() {
    for (const job of this.jobs) {
      this.tasks.push(...makeTasks(job.id, 600_000, job.progress))
      this.logs.push(...makeLogs(job.id, 600_000, 8 + Math.floor(Math.random() * 12)))
      if (job.progress > 30) this.artifacts.push(...makeArtifacts(job.id))
    }
    this.startTicker()
  }

  // ---------------------------------------------------------------- lifecycle

  private startTicker() {
    if (this.timer !== null) return
    this.timer = window.setInterval(() => this.tick(), 1000)
  }

  private emit(event: JobEvent) {
    for (const key of [event.jobId, 'all']) {
      const set = this.listeners.get(key)
      if (set) for (const listener of set) listener(event)
    }
  }

  private log(jobId: string, level: LogEntry['level'], message: string): LogEntry {
    const entry: LogEntry = {
      id: `${jobId}-l${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId,
      ts: new Date().toISOString(),
      level,
      message,
    }
    this.logs.push(entry)
    this.emit({ type: 'log', jobId, entry, ts: entry.ts })
    return entry
  }

  private setStatus(job: Job, status: Job['status']) {
    job.status = status
    job.updatedAt = new Date().toISOString()
    this.emit({ type: 'status', jobId: job.id, status, ts: job.updatedAt })
  }

  /** One simulation step for every active job. */
  private tick() {
    for (const job of [...this.jobs]) {
      if (job.status !== 'running') continue
      const step = 0.5 + Math.random() * 2
      job.progress = Math.min(100, job.progress + step)
      job.updatedAt = new Date().toISOString()
      this.emit({ type: 'progress', jobId: job.id, progress: job.progress, ts: job.updatedAt })

      if (Math.random() < 0.4) {
        this.log(job.id, 'info', pick([
          'Reading workspace files',
          'Applying patch to src/server/routes.ts',
          'Running npm test',
          'Collecting artifacts',
          'Plan step completed, moving to next stage',
        ], Math.random))
      }
      if (Math.random() < 0.08) {
        this.log(job.id, 'warn', 'Warning: deprecated API usage detected')
      }
      if (Math.random() < 0.04) {
        this.setStatus(job, 'waiting_approval')
        this.log(job.id, 'warn', 'Waiting for user approval to write files')
        continue
      }
      if (Math.random() < 0.03) {
        this.setStatus(job, 'failed')
        job.finishedAt = new Date().toISOString()
        job.error = 'Network timeout while calling test runner'
        this.log(job.id, 'error', 'Error: network timeout while fetching fixture')
        continue
      }
      if (job.progress >= 100) {
        this.setStatus(job, 'completed')
        job.finishedAt = new Date().toISOString()
        for (const t of this.tasks.filter((t) => t.jobId === job.id)) {
          t.status = 'done'
          t.updatedAt = job.updatedAt
          this.emit({ type: 'task', jobId: job.id, task: t, ts: t.updatedAt })
        }
        this.log(job.id, 'info', 'Job completed successfully')
      } else {
        const active = this.tasks.find((t) => t.jobId === job.id && t.status === 'in_progress')
        if (active && Math.random() < 0.15) {
          active.status = 'done'
          active.updatedAt = job.updatedAt
          this.emit({ type: 'task', jobId: job.id, task: active, ts: active.updatedAt })
          const next = this.tasks.find((t) => t.jobId === job.id && t.status === 'pending')
          if (next) {
            next.status = 'in_progress'
            next.updatedAt = job.updatedAt
            this.emit({ type: 'task', jobId: job.id, task: next, ts: next.updatedAt })
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------- queries

  async startJob(
    requirement: string,
    options: { model: string; agentProfile: string; mode: 'interactive' | 'autonomous'; requireApproval: boolean },
  ): Promise<Job> {
    await delay(LATENCY)
    const id = `job-${Date.now()}`
    const now = new Date().toISOString()
    const planTitles = ['Analyze codebase and collect context', 'Draft implementation plan', 'Implement the change', 'Run full test suite']
    const job: Job = {
      id,
      requirement,
      status: 'queued',
      progress: 0,
      model: options.model,
      agentProfile: options.agentProfile,
      mode: options.mode,
      requireApproval: options.requireApproval,
      createdAt: now,
      startedAt: now,
      updatedAt: now,
      plan: planTitles.map((title, i) => ({
        id: `${id}-t${i + 1}`,
        title,
        status: i === 0 ? 'in_progress' : 'pending',
      })),
      currentStep: planTitles[0] as string,
    }
    this.jobs.unshift(job)
    this.tasks.push(
      ...makeTasks(id, 0, 0).map((t, i) => ({ ...t, title: planTitles[i % planTitles.length] as string })),
    )
    this.log(id, 'info', `Job queued with model ${options.model}`)
    // Simulate the runner picking the job up shortly after.
    window.setTimeout(() => {
      if (job.status === 'queued') {
        this.setStatus(job, 'running')
        this.log(id, 'info', 'Job started')
      }
    }, 2500)
    return { ...job }
  }

  async getJobs(filters: JobFilters = {}) {
    await delay(LATENCY)
    const { search, status, page = 1, pageSize = 10 } = filters
    let items = [...this.jobs]
    if (status && status !== 'all') items = items.filter((j) => j.status === status)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((j) => j.requirement.toLowerCase().includes(q) || j.id.toLowerCase().includes(q))
    }
    const total = items.length
    items = items.slice((page - 1) * pageSize, page * pageSize)
    return { items: items.map((j) => ({ ...j })), total }
  }

  async getJobById(id: string) {
    await delay(LATENCY)
    const job = this.jobs.find((j) => j.id === id)
    return job ? { ...job } : null
  }

  async getTasks(jobId?: string) {
    await delay(LATENCY)
    return (jobId ? this.tasks.filter((t) => t.jobId === jobId) : this.tasks).map((t) => ({ ...t }))
  }

  async getLogs(jobId?: string, filters: LogFilters = {}) {
    await delay(LATENCY)
    let items = jobId ? this.logs.filter((l) => l.jobId === jobId) : [...this.logs]
    if (filters.jobId && !jobId) items = items.filter((l) => l.jobId === filters.jobId)
    if (filters.level && filters.level !== 'all') items = items.filter((l) => l.level === filters.level)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter((l) => l.message.toLowerCase().includes(q))
    }
    return items.sort((a, b) => a.ts.localeCompare(b.ts)).map((l) => ({ ...l }))
  }

  async getArtifacts(jobId: string) {
    await delay(LATENCY)
    return this.artifacts.filter((a) => a.jobId === jobId).map((a) => ({ ...a }))
  }

  // ------------------------------------------------------------------- actions

  private async mutate(id: string, fn: (job: Job) => void): Promise<Job> {
    await delay(LATENCY)
    const job = this.jobs.find((j) => j.id === id)
    if (!job) throw new Error(`Job ${id} not found`)
    fn(job)
    return { ...job }
  }

  pauseJob(id: string) {
    return this.mutate(id, (job) => {
      if (job.status !== 'running' && job.status !== 'queued') throw new Error('Only running jobs can be paused')
      this.setStatus(job, 'paused')
      this.log(id, 'info', 'Job paused by user')
    })
  }

  resumeJob(id: string) {
    return this.mutate(id, (job) => {
      if (job.status !== 'paused') throw new Error('Only paused jobs can be resumed')
      this.setStatus(job, 'running')
      this.log(id, 'info', 'Job resumed by user')
    })
  }

  cancelJob(id: string) {
    return this.mutate(id, (job) => {
      if (['completed', 'failed', 'cancelled'].includes(job.status)) {
        throw new Error('Job is already finished')
      }
      this.setStatus(job, 'cancelled')
      job.finishedAt = new Date().toISOString()
      this.log(id, 'warn', 'Job cancelled by user')
    })
  }

  retryJob(id: string) {
    return this.mutate(id, (job) => {
      if (job.status !== 'failed' && job.status !== 'cancelled') {
        throw new Error('Only failed or cancelled jobs can be retried')
      }
      this.setStatus(job, 'queued')
      job.progress = 0
      job.finishedAt = undefined
      job.error = undefined
      for (const t of this.tasks.filter((t) => t.jobId === id)) {
        t.status = t.status === 'done' ? 'done' : 'pending'
        t.updatedAt = job.updatedAt
      }
      this.log(id, 'info', 'Job re-queued for retry')
      window.setTimeout(() => {
        if (job.status === 'queued') {
          this.setStatus(job, 'running')
        }
      }, 2500)
    })
  }

  // -------------------------------------------------------------------- events

  subscribeToJobEvents(jobId: string | 'all', listener: JobEventListener) {
    const key = jobId
    let set = this.listeners.get(key)
    if (!set) {
      set = new Set()
      this.listeners.set(key, set)
    }
    set.add(listener)
    return {
      unsubscribe: () => {
        set?.delete(listener)
        if (set && set.size === 0) this.listeners.delete(key)
      },
    }
  }

  async getRuntimeStatus(): Promise<RuntimeStatus> {
    return { ...this.runtime }
  }
}

export { MockHarnessApi }
