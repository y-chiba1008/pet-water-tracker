import { useQuery } from '@tanstack/react-query'
import {
  fetchActiveCycle,
  fetchAllActiveCycles,
  fetchLatestCompletedCycle,
  fetchLatestCompletedCyclesByBowlIds,
} from '@/features/bowl-records/api/bowlRecordRepository'

export const activeCyclesQueryKey = ['bowl-records', 'active'] as const

export function activeCycleQueryKey(bowlId: string) {
  return ['bowl-records', 'active', bowlId] as const
}

export function latestCompletedCycleQueryKey(bowlId: string) {
  return ['bowl-records', 'latest-completed', bowlId] as const
}

export function latestCompletedCyclesByBowlIdsQueryKey(bowlIds: string[]) {
  return [
    'bowl-records',
    'latest-completed-many',
    ...[...bowlIds].sort(),
  ] as const
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

export function useLatestCompletedCycle(bowlId: string | null) {
  return useQuery({
    queryKey: bowlId
      ? latestCompletedCycleQueryKey(bowlId)
      : (['bowl-records', 'latest-completed', 'none'] as const),
    queryFn: () => {
      if (!bowlId) {
        return Promise.resolve(null)
      }
      return fetchLatestCompletedCycle(bowlId)
    },
    enabled: Boolean(bowlId),
  })
}

export function useLatestCompletedCyclesByBowlIds(bowlIds: string[]) {
  const sortedBowlIds = [...bowlIds].sort()

  return useQuery({
    queryKey: latestCompletedCyclesByBowlIdsQueryKey(sortedBowlIds),
    queryFn: () => fetchLatestCompletedCyclesByBowlIds(sortedBowlIds),
    enabled: sortedBowlIds.length > 0,
  })
}
