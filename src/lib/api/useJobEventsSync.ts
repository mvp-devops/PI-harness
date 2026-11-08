import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { harnessApi } from './index'
import { qk } from './queryKeys'
import type { Job } from '@/types'

/**
 * Bridges the harness event stream into the query cache.
 * - progress updates are patched in place (no refetch);
 * - status / task / log events invalidate the affected queries.
 * Mounted once at the application root.
 */
export function useJobEventsSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const patchJob = (jobId: string, patch: Partial<Job>) => {
      queryClient.setQueriesData<{ items: Job[]; total: number }>({ queryKey: ['jobs'] }, (data) =>
        data
          ? {
              ...data,
              items: data.items.map((j) => (j.id === jobId ? { ...j, ...patch } : j)),
            }
          : data,
      )
      queryClient.setQueryData<Job | null>(qk.job(jobId), (job) => (job ? { ...job, ...patch } : job))
    }

    const subscription = harnessApi.subscribeToJobEvents('all', (event) => {
      switch (event.type) {
        case 'progress':
          patchJob(event.jobId, { progress: event.progress, updatedAt: event.ts })
          break
        case 'status':
          patchJob(event.jobId, { status: event.status, updatedAt: event.ts })
          void queryClient.invalidateQueries({ queryKey: ['tasks'] })
          break
        case 'task':
          void queryClient.invalidateQueries({ queryKey: ['tasks'] })
          void queryClient.invalidateQueries({ queryKey: qk.job(event.jobId) })
          break
        case 'log':
          void queryClient.invalidateQueries({ queryKey: ['logs'] })
          break
      }
    })
    return () => subscription.unsubscribe()
  }, [queryClient])
}
