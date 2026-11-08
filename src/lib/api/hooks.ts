import { useQuery } from '@tanstack/react-query'
import { harnessApi } from './index'
import { qk } from './queryKeys'
import type { JobFilters, LogFilters } from '@/types'

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: qk.jobs(filters),
    queryFn: () => harnessApi.getJobs(filters),
    placeholderData: (prev) => prev,
  })
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: qk.job(id ?? ''),
    queryFn: () => harnessApi.getJobById(id!),
    enabled: Boolean(id),
  })
}

export function useTasks(jobId?: string) {
  return useQuery({
    queryKey: qk.tasks(jobId),
    queryFn: () => harnessApi.getTasks(jobId),
  })
}

export function useLogs(jobId?: string, filters: LogFilters = {}) {
  return useQuery({
    queryKey: qk.logs(jobId, filters),
    queryFn: () => harnessApi.getLogs(jobId, filters),
    placeholderData: (prev) => prev,
  })
}

export function useArtifacts(jobId: string | undefined) {
  return useQuery({
    queryKey: qk.artifacts(jobId ?? ''),
    queryFn: () => harnessApi.getArtifacts(jobId!),
    enabled: Boolean(jobId),
  })
}
