import type { JobFilters, LogFilters } from '@/types'

/** Centralized query keys keep invalidation and optimistic updates consistent. */
export const qk = {
  jobs: (filters: JobFilters = {}) => ['jobs', filters] as const,
  job: (id: string) => ['job', id] as const,
  tasks: (jobId?: string) => ['tasks', jobId ?? 'all'] as const,
  logs: (jobId?: string, filters: LogFilters = {}) => ['logs', jobId ?? 'all', filters] as const,
  artifacts: (jobId: string) => ['artifacts', jobId] as const,
  runtime: () => ['runtime-status'] as const,
}
