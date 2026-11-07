import type {
  Artifact,
  Job,
  JobEventListener,
  JobEventSubscription,
  JobFilters,
  JobStatus,
  LogEntry,
  LogFilters,
  RuntimeStatus,
  StartJobOptions,
  Task,
} from '@/types'

/**
 * Contract between the UI and the Pi harness backend.
 *
 * The screens depend only on this interface. Today it is implemented by an
 * in-memory mock (`src/mocks/mockApi.ts`); to attach a real Pi RPC/WebSocket
 * backend, provide another implementation to `createHarnessApi`.
 */
export interface HarnessApi {
  /** Create and start a new job from a free-form requirement. */
  startJob(requirement: string, options: StartJobOptions): Promise<Job>

  /** Paginated, filterable job list. */
  getJobs(filters?: JobFilters): Promise<{ items: Job[]; total: number }>

  /** Single job or null when not found. */
  getJobById(id: string): Promise<Job | null>

  pauseJob(id: string): Promise<Job>
  resumeJob(id: string): Promise<Job>
  cancelJob(id: string): Promise<Job>
  retryJob(id: string): Promise<Job>

  /** Sub-tasks, optionally scoped to one job. */
  getTasks(jobId?: string): Promise<Task[]>

  /** Log lines, optionally scoped and filtered. */
  getLogs(jobId?: string, filters?: LogFilters): Promise<LogEntry[]>

  /** Files created/modified by a job. */
  getArtifacts(jobId: string): Promise<Artifact[]>

  /**
   * Live job events. Pass a concrete jobId or 'all' to observe every job.
   * The transport (WebSocket/SSE) is an implementation detail.
   */
  subscribeToJobEvents(jobId: string | 'all', listener: JobEventListener): JobEventSubscription

  /** Current Pi runtime connection state. */
  getRuntimeStatus(): Promise<RuntimeStatus>
}

export type { JobStatus }
