/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '@/shared/components/UserMenu'
import { signOut } from '@/features/login/api/authRepository'
import { useAuth } from '@/features/login/hooks/useAuth'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/features/login/api/authRepository', () => ({
  signOut: vi.fn(),
}))

vi.mock('@/features/login/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedSignOut = vi.mocked(signOut)
const mockedUseAuth = vi.mocked(useAuth)

describe('UserMenu sign-out error UI', () => {
  beforeEach(() => {
    mockedSignOut.mockReset()
    mockedUseAuth.mockReturnValue(
      asHookResult({
        session: null,
        user: { email: 'test@example.com' },
        isLoading: false,
        sessionError: null,
      }),
    )
  })

  it('shows an error message when sign-out fails', async () => {
    const user = userEvent.setup()
    mockedSignOut.mockRejectedValue(new Error('network error'))

    render(<UserMenu />)

    await user.click(screen.getByRole('button', { name: 'アカウントメニュー' }))
    await user.click(await screen.findByText('ログアウト'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ログアウトに失敗しました。もう一度お試しください。',
    )
  })
})
