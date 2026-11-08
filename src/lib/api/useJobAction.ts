import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui'
import { harnessApi } from './index'
import { qk } from './queryKeys'
import type { Job, JobStatus } from '@/types'

export type JobAction = 'pauseJob' | 'resumeJob' | 'cancelJob' | 'retryJob'

/** Optimistic status shown immediately while the request is in flight. */
const OPTIMISTIC_STATUS: Record<JobAction, JobStatus> = {
  pauseJob: 'paused',
  resumeJob: 'running',
  cancelJob: 'cancelled',
  retryJob: 'queued',
}

const ACTION_LABEL: Record<JobAction, string> = {
  pauseJob: 'paused',
  resumeJob: 'resumed',
  cancelJob: 'cancelled',
  retryJob: 'queued for retry',
}

const ACTION_VERB: Record<JobAction, string> = {
  pauseJob: 'pause',
  resumeJob: 'resume',
  cancelJob: 'cancel',
  retryJob: 'retry',
}

/**
 * Optimistic job actions with rollback + error toast on failure.
 * Returns a mutation; screens decide when confirmation modals are shown.
 */
export function useJobAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ action, id }: { action: JobAction; id: string }) => harnessApi[action](id),
    onMutate: async ({ action, id }) => {
      await queryClient.cancelQueries({ queryKey: qk.job(id) })
      const previousDetail = queryClient.getQueryData<Job>(qk.job(id)) ?? null
      const optimistic = { status: OPTIMISTIC_STATUS[action], updatedAt: new Date().toISOString() }

      queryClient.setQueryData<Job | null>(qk.job(id), (job) => (job ? { ...job, ...optimistic } : job))
      queryClient.setQueriesData<{ items: Job[]; total: number }>({ queryKey: ['jobs'] }, (data) =>
        data
          ? { ...data, items: data.items.map((j) => (j.id === id ? { ...j, ...optimistic } : j)) }
          : data,
      )
      return { previousDetail }
    },
    onError: (error, { id, action }, context) => {
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(qk.job(id), context.previousDetail)
      }
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast('error', `Failed to ${ACTION_VERB[action]} job: ${messageOf(error)}`)
    },
    onSuccess: (_job, { action, id }) => {
      toast('success', `Job ${id} ${ACTION_LABEL[action]}`)
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: qk.job(id) })
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error'
}
