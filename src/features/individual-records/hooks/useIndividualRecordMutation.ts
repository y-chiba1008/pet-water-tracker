import { useMutation, useQueryClient } from '@tanstack/react-query'
import { insertIndividualRecord } from '@/features/individual-records/api/individualRecordRepository'
import type { InsertIndividualRecordInput } from '@/features/individual-records/types'
import { dailySummaryQueryKey } from '@/features/visualization/hooks/useDailySummary'

export const individualRecordsQueryKey = ['individual-records'] as const

export function useInsertIndividualRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InsertIndividualRecordInput) =>
      insertIndividualRecord(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: individualRecordsQueryKey,
        }),
        queryClient.invalidateQueries({ queryKey: dailySummaryQueryKey }),
      ])
    },
  })
}
