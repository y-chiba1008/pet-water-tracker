import { useMutation, useQueryClient } from '@tanstack/react-query'
import { insertIndividualRecord } from '@/features/individual-records/api/individualRecordRepository'
import type { InsertIndividualRecordInput } from '@/features/individual-records/types'

export const individualRecordsQueryKey = ['individual-records'] as const

export function useInsertIndividualRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InsertIndividualRecordInput) =>
      insertIndividualRecord(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: individualRecordsQueryKey,
      })
    },
  })
}
