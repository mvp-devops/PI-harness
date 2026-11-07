/** Job status as defined by the Pi harness lifecycle. */
export type JobStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'paused'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Task status across all jobs. */
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'done' | 'failed'

/** Log severity levels. */
export type LogLevel = 'info' | 'warn' | 'error'

/** Job launch mode. */
export type JobMode = 'interactive' | 'autonomous'

/** A unit of work executed by the harness. */
export interface Job {
  id: string
  /** Free-form requirement text the job was started with. */
  requirement: string
  status: JobStatus
  progress: number // 0..100
  model: string
  agentProfile: string
  mode: JobMode
  requireApproval: boolean
  createdAt: string // ISO
  startedAt?: string
  updatedAt: string
  finishedAt?: string
  /** High-level plan steps for the Overview tab. */
  plan: PlanStep[]
  currentStep?: string
  error?: string
}

/** A single step of a job plan. */
export interface PlanStep {
  id: string
  title: string
  status: TaskStatus
}

/** A sub-task belonging to a job. */
export interface Task {
  id: string
  jobId: string
  title: string
  status: TaskStatus
  assignee: string
  updatedAt: string
  blockedReason?: string
}

/** One log line streamed by the harness. */
export interface LogEntry {
  id: string
  jobId: string
  ts: string
  level: LogLevel
  message: string
}

/** Artifact produced or modified by a job. */
export interface Artifact {
  id: string
  jobId: string
  path: string
  change: 'created' | 'modified'
  status: 'ok' | 'failed' | 'pending'
}

/** Pi runtime connection state shown in the sidebar. */
export type RuntimeState = 'connected' | 'disconnected' | 'reconnecting'

export interface RuntimeStatus {
  state: RuntimeState
  url: string
  version?: string
}

/** Options accepted by startJob. */
export interface StartJobOptions {
  model: string
  agentProfile: string
  mode: JobMode
  requireApproval: boolean
}

/** List filters for the Jobs screen. */
export interface JobFilters {
  search?: string
  status?: JobStatus | 'all'
  page?: number
  pageSize?: number
}

/** List filters for log views. */
export interface LogFilters {
  search?: string
  level?: LogLevel | 'all'
  jobId?: string
}

/** A single job event delivered via the event subscription. */
export type JobEvent =
  | { type: 'status'; jobId: string; status: JobStatus; ts: string }
  | { type: 'progress'; jobId: string; progress: number; ts: string }
  | { type: 'log'; jobId: string; entry: LogEntry; ts: string }
  | { type: 'task'; jobId: string; task: Task; ts: string }

export type JobEventListener = (event: JobEvent) => void

export interface JobEventSubscription {
  unsubscribe: () => void
}

/** Connection settings managed on the Settings screen. */
export interface ConnectionSettings {
  url: string
  token: string
}
