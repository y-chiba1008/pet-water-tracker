/** @vitest-environment jsdom */
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IndividualRecordPage } from '@/features/individual-records/components/IndividualRecordPage'
import { useInsertIndividualRecord } from '@/features/individual-records/hooks/useIndividualRecordMutation'
import { useAuth } from '@/features/login/hooks/useAuth'
import type { IndividualRecordFormValues } from '@/features/individual-records/lib/individualRecordFormSchema'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/shared/components/AppShell', () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/login/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock(
  '@/features/individual-records/hooks/useIndividualRecordMutation',
  () => ({
    useInsertIndividualRecord: vi.fn(),
  }),
)

vi.mock(
  '@/features/individual-records/components/IndividualRecordForm',
  () => ({
    IndividualRecordForm: ({
      onSubmit,
      errorMessage,
    }: {
      onSubmit: (values: IndividualRecordFormValues) => Promise<void>
      errorMessage: string | null
    }) => (
      <div>
        <button
          type="button"
          onClick={() =>
            void onSubmit({
              recordedAt: '2026-09-22T10:00',
              amountMl: 15,
            })
          }
        >
          記録を保存する
        </button>
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      </div>
    ),
  }),
)

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseInsertIndividualRecord = vi.mocked(useInsertIndividualRecord)

describe('IndividualRecordPage error UI', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue(
      asHookResult({
        user: { id: 'user-1' },
      }),
    )
  })

  it('shows the save failure message when mutation rejects', async () => {
    const user = userEvent.setup()
    mockedUseInsertIndividualRecord.mockReturnValue(
      asHookResult({
        mutateAsync: vi.fn().mockRejectedValue(new Error('network')),
        isPending: false,
      }),
    )

    render(<IndividualRecordPage />)

    await user.click(screen.getByRole('button', { name: '記録を保存する' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '保存に失敗しました。もう一度お試しください。',
    )
  })
})
