/** @vitest-environment jsdom */
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BowlListPage } from '@/features/bowls/components/BowlListPage'
import {
  useActiveCycles,
  useLatestCompletedCyclesByBowlIds,
} from '@/features/bowl-records/hooks/useActiveCycle'
import {
  useCreateBowl,
  useDeactivateBowl,
  useUpdateBowlName,
} from '@/features/bowls/hooks/useBowlMutations'
import { useBowls } from '@/features/bowls/hooks/useBowls'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/shared/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/bowls/hooks/useBowls', () => ({
  useBowls: vi.fn(),
}))

vi.mock('@/features/bowl-records/hooks/useActiveCycle', () => ({
  useActiveCycles: vi.fn(),
  useLatestCompletedCyclesByBowlIds: vi.fn(),
}))

vi.mock('@/features/bowls/hooks/useBowlMutations', () => ({
  useCreateBowl: vi.fn(),
  useUpdateBowlName: vi.fn(),
  useDeactivateBowl: vi.fn(),
}))

const mockedUseBowls = vi.mocked(useBowls)
const mockedUseActiveCycles = vi.mocked(useActiveCycles)
const mockedUseLatestCompletedCyclesByBowlIds = vi.mocked(
  useLatestCompletedCyclesByBowlIds,
)
const mockedUseCreateBowl = vi.mocked(useCreateBowl)
const mockedUseUpdateBowlName = vi.mocked(useUpdateBowlName)
const mockedUseDeactivateBowl = vi.mocked(useDeactivateBowl)

function idleMutation() {
  return asHookResult({
    mutateAsync: vi.fn(),
    isPending: false,
  })
}

describe('BowlListPage error UI', () => {
  beforeEach(() => {
    mockedUseCreateBowl.mockReturnValue(idleMutation())
    mockedUseUpdateBowlName.mockReturnValue(idleMutation())
    mockedUseDeactivateBowl.mockReturnValue(idleMutation())
    mockedUseActiveCycles.mockReturnValue(
      asHookResult({
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isFetching: false,
      }),
    )
    mockedUseLatestCompletedCyclesByBowlIds.mockReturnValue(
      asHookResult({
        data: new Map(),
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        isFetching: false,
      }),
    )
  })

  it('shows the fetch failure message and reloads on click', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    const refetchCycles = vi.fn()
    const refetchLatest = vi.fn()

    mockedUseBowls.mockReturnValue(
      asHookResult({
        data: [],
        isLoading: false,
        isError: true,
        refetch,
        isFetching: false,
      }),
    )
    mockedUseActiveCycles.mockReturnValue(
      asHookResult({
        data: [],
        isLoading: false,
        isError: false,
        refetch: refetchCycles,
        isFetching: false,
      }),
    )
    mockedUseLatestCompletedCyclesByBowlIds.mockReturnValue(
      asHookResult({
        data: new Map(),
        isLoading: false,
        isError: false,
        refetch: refetchLatest,
        isFetching: false,
      }),
    )

    render(<BowlListPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '水皿一覧の取得に失敗しました。もう一度お試しください。',
    )

    await user.click(screen.getByRole('button', { name: '再読み込み' }))
    expect(refetch).toHaveBeenCalledTimes(1)
    expect(refetchCycles).toHaveBeenCalledTimes(1)
    expect(refetchLatest).toHaveBeenCalledTimes(1)
  })
})
