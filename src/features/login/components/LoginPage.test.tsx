/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { LoginPage } from '@/features/login/components/LoginPage'
import { signInWithGoogle } from '@/features/login/api/authRepository'
import { useAuth } from '@/features/login/hooks/useAuth'
import { asHookResult } from '@/test/asHookResult'

vi.mock('@/features/login/api/authRepository', () => ({
  signInWithGoogle: vi.fn(),
}))

vi.mock('@/features/login/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedSignInWithGoogle = vi.mocked(signInWithGoogle)
const mockedUseAuth = vi.mocked(useAuth)

describe('LoginPage error UI', () => {
  beforeEach(() => {
    mockedSignInWithGoogle.mockReset()
    mockedUseAuth.mockReturnValue(
      asHookResult({
        session: null,
        user: null,
        isLoading: false,
        sessionError: null,
      }),
    )
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

  it('shows the session error from AuthProvider', () => {
    mockedUseAuth.mockReturnValue(
      asHookResult({
        session: null,
        user: null,
        isLoading: false,
        sessionError: 'ログインに失敗しました。もう一度お試しください。',
      }),
    )

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'ログインに失敗しました。もう一度お試しください。',
    )
  })

  it('prefers the OAuth callback error over sessionError', () => {
    window.history.replaceState(
      {},
      '',
      '/login#error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed',
    )
    mockedUseAuth.mockReturnValue(
      asHookResult({
        session: null,
        user: null,
        isLoading: false,
        sessionError: 'ログインに失敗しました。もう一度お試しください。',
      }),
    )

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'このアカウントではログインできません。',
    )
  })
})
