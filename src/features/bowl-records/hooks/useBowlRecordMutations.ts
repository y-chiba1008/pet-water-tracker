import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  completeCycleAndStartNext,
  insertStartRecord,
  updateEndRecord,
} from '@/features/bowl-records/api/bowlRecordRepository'
import { activeCyclesQueryKey } from '@/features/bowl-records/hooks/useActiveCycle'
import type {
  CompleteCycleAndStartNextInput,
  InsertStartRecordInput,
  UpdateEndRecordInput,
} from '@/features/bowl-records/types'

async function invalidateActiveCycles(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: activeCyclesQueryKey })
}

export function useInsertStartRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InsertStartRecordInput) => insertStartRecord(input),
    onSuccess: async () => {
      await invalidateActiveCycles(queryClient)
    },
  })
}

export function useUpdateEndRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEndRecordInput) => updateEndRecord(input),
    onSuccess: async () => {
      await invalidateActiveCycles(queryClient)
    },
  })
}

export function useCompleteCycleAndStartNext() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CompleteCycleAndStartNextInput) =>
      completeCycleAndStartNext(input),
    onSuccess: async () => {
      await invalidateActiveCycles(queryClient)
    },
  })
}
