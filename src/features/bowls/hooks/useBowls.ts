import { useQuery } from '@tanstack/react-query'
import { fetchActiveBowls } from '@/features/bowls/api/bowlRepository'

export const bowlsQueryKey = ['bowls', 'active'] as const

export function useBowls() {
  return useQuery({
    queryKey: bowlsQueryKey,
    queryFn: fetchActiveBowls,
  })
}
