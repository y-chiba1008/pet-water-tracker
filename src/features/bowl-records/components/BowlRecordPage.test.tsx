/** @vitest-environment jsdom */
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BowlRecordPage } from '@/features/bowl-records/components/BowlRecordPage'
import {
  useActiveCycles,
  useLatestCompletedCycle,
} from '@/features/bowl-records/hooks/useActiveCycle'
import {
  useCompleteCycleAndStartNext,
  useInsertStartRecord,
  useUpdateEndRecord,
} from '@/features/bowl-records/hooks/useBowlRecordMutations'
import { useBowls } from '@/features/bowls/hooks/useBowls'
import { useAuth } from '@/features/login/hooks/useAuth'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/shared/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/bowls/hooks/useBowls', () => ({
  useBowls: vi.fn(),
}))

vi.mock('@/features/bowl-records/hooks/useActiveCycle', () => ({
  useActiveCycles: vi.fn(),
  useLatestCompletedCycle: vi.fn(),
}))

vi.mock('@/features/bowl-records/hooks/useBowlRecordMutations', () => ({
  useInsertStartRecord: vi.fn(),
  useUpdateEndRecord: vi.fn(),
  useCompleteCycleAndStartNext: vi.fn(),
}))

vi.mock('@/features/login/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedUseBowls = vi.mocked(useBowls)
const mockedUseActiveCycles = vi.mocked(useActiveCycles)
const mockedUseLatestCompletedCycle = vi.mocked(useLatestCompletedCycle)
const mockedUseInsertStartRecord = vi.mocked(useInsertStartRecord)
const mockedUseUpdateEndRecord = vi.mocked(useUpdateEndRecord)
const mockedUseCompleteCycleAndStartNext = vi.mocked(useCompleteCycleAndStartNext)
const mockedUseAuth = vi.mocked(useAuth)

function idleMutation() {
  return asHookResult({
    mutateAsync: vi.fn(),
    isPending: false,
  })
}

describe('BowlRecordPage error UI', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue(
      asHookResult({
        user: { id: 'user-1' },
      }),
    )
    mockedUseInsertStartRecord.mockReturnValue(idleMutation())
    mockedUseUpdateEndRecord.mockReturnValue(idleMutation())
    mockedUseCompleteCycleAndStartNext.mockReturnValue(idleMutation())
    mockedUseLatestCompletedCycle.mockReturnValue(
      asHookResult({
        data: null,
      }),
    )
  })

  it('shows the fetch failure message and reloads on click', async () => {
    const user = userEvent.setup()
    const refetchBowls = vi.fn()
    const refetchCycles = vi.fn()

    mockedUseBowls.mockReturnValue(
      asHookResult({
        data: [],
        isLoading: false,
        isError: true,
        refetch: refetchBowls,
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

    render(<BowlRecordPage />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      '水皿記録データの取得に失敗しました。もう一度お試しください。',
    )

    await user.click(screen.getByRole('button', { name: '再読み込み' }))
    expect(refetchBowls).toHaveBeenCalledTimes(1)
    expect(refetchCycles).toHaveBeenCalledTimes(1)
  })
})
