import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBowl,
  deactivateBowl,
  updateBowlName,
} from '@/features/bowls/api/bowlRepository'
import { bowlsQueryKey } from '@/features/bowls/hooks/useBowls'

export function useCreateBowl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createBowl(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bowlsQueryKey })
    },
  })
}

export function useUpdateBowlName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateBowlName(id, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bowlsQueryKey })
    },
  })
}

export function useDeactivateBowl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deactivateBowl(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bowlsQueryKey })
    },
  })
}
