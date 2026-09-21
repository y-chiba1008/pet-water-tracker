import { useQuery } from '@tanstack/react-query'
import {
  fetchActiveCycle,
  fetchAllActiveCycles,
} from '@/features/bowl-records/api/bowlRecordRepository'

export const activeCyclesQueryKey = ['bowl-records', 'active'] as const

export function activeCycleQueryKey(bowlId: string) {
  return ['bowl-records', 'active', bowlId] as const
}

export function useActiveCycles() {
  return useQuery({
    queryKey: activeCyclesQueryKey,
    queryFn: fetchAllActiveCycles,
  })
}

export function useActiveCycle(bowlId: string | null) {
  return useQuery({
    queryKey: bowlId
      ? activeCycleQueryKey(bowlId)
      : (['bowl-records', 'active', 'none'] as const),
    queryFn: () => {
      if (!bowlId) {
        return Promise.resolve(null)
      }
      return fetchActiveCycle(bowlId)
    },
    enabled: Boolean(bowlId),
  })
}
