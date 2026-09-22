/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginPage } from '@/features/login/components/LoginPage'
import { signInWithGoogle } from '@/features/login/api/authRepository'

vi.mock('@/features/login/api/authRepository', () => ({
  signInWithGoogle: vi.fn(),
}))

const mockedSignInWithGoogle = vi.mocked(signInWithGoogle)

describe('LoginPage error UI', () => {
  beforeEach(() => {
    mockedSignInWithGoogle.mockReset()
    window.history.replaceState({}, '', '/login')
  })

  it('shows the login failure message when Google sign-in rejects', async () => {
    const user = userEvent.setup()
    mockedSignInWithGoogle.mockRejectedValue(new Error('oauth failed'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Google でログイン' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ログインに失敗しました。もう一度お試しください。',
    )
  })
})
