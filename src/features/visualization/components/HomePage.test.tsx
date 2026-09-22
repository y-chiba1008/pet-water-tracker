/** @vitest-environment jsdom */
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from '@/features/visualization/components/HomePage'
import { useDailySummary } from '@/features/visualization/hooks/useDailySummary'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/shared/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/visualization/hooks/useDailySummary', () => ({
  useDailySummary: vi.fn(),
}))

const mockedUseDailySummary = vi.mocked(useDailySummary)

describe('HomePage error UI', () => {
  beforeEach(() => {
    mockedUseDailySummary.mockReset()
  })

  it('shows the fetch failure message and reloads on click', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockedUseDailySummary.mockReturnValue(
      asHookResult({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
        isFetching: false,
      }),
    )

    render(<HomePage />)

    expect(
      screen.getByText(
        '集計データの取得に失敗しました。もう一度お試しください。',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '再読み込み' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
