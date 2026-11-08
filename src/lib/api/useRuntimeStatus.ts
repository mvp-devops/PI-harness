import { useQuery } from '@tanstack/react-query'
import { harnessApi } from './index'

/** Poll the Pi runtime connection state for the sidebar indicator. */
export function useRuntimeStatus() {
  return useQuery({
    queryKey: ['runtime-status'],
    queryFn: () => harnessApi.getRuntimeStatus(),
    refetchInterval: 5000,
  })
}
