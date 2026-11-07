import type { JobStatus, LogLevel, TaskStatus } from '@/types'

/** Human label for a job status. */
export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  draft: 'Draft',
  queued: 'Queued',
  running: 'Running',
  paused: 'Paused',
  waiting_approval: 'Waiting approval',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

/** Tailwind classes for job status badges (color + look; label/icon provide non-color distinction). */
export const JOB_STATUS_CLASS: Record<JobStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  queued: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  running: 'bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-900 dark:text-accent-200 dark:border-accent-800',
  paused: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  waiting_approval: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
  completed: 'bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-900 dark:text-accent-200 dark:border-accent-800',
  failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
  cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
}

/** Whether a job is in an active/busy state. */
export function isJobActive(status: JobStatus): boolean {
  return status === 'running' || status === 'queued' || status === 'waiting_approval'
}

/** Human label for a task status. */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
  failed: 'Failed',
}

export const TASK_STATUS_CLASS: Record<TaskStatus, string> = {
  pending: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
  blocked: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  done: 'bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-900 dark:text-accent-200 dark:border-accent-800',
  failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
}

/** Text token + classes for log levels. */
export const LOG_LEVEL_CLASS: Record<LogLevel, string> = {
  info: 'text-neutral-600 dark:text-neutral-400',
  warn: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
}

export const LOG_LEVEL_LABEL: Record<LogLevel, string> = {
  info: 'info',
  warn: 'warn',
  error: 'error',
}
