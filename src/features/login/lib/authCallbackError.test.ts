import { describe, expect, it } from 'vitest'
import {
  hasAuthCallbackParams,
  parseAuthCallbackError,
  toLoginErrorMessage,
} from '@/features/login/lib/authCallbackError'

describe('parseAuthCallbackError', () => {
  it('returns null when no auth error params exist', () => {
    expect(
      parseAuthCallbackError('http://localhost:3000/login'),
    ).toBeNull()
  })

  it('parses error params from the query string', () => {
    expect(
      parseAuthCallbackError(
        'http://localhost:3000/login?error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance',
      ),
    ).toEqual({
      error: 'access_denied',
      errorCode: 'signup_disabled',
      errorDescription: 'Signups not allowed for this instance',
    })
  })

  it('parses error params from the hash fragment', () => {
    expect(
      parseAuthCallbackError(
        'http://localhost:3000/login#error=access_denied&error_code=422&error_description=Signups+not+allowed+for+this+instance',
      ),
    ).toEqual({
      error: 'access_denied',
      errorCode: '422',
      errorDescription: 'Signups not allowed for this instance',
    })
  })
})

describe('hasAuthCallbackParams', () => {
  it('returns false when no callback params exist', () => {
    expect(hasAuthCallbackParams('http://localhost:3000/login')).toBe(false)
  })

  it('returns true when a PKCE code remains in the query string', () => {
    expect(
      hasAuthCallbackParams('http://localhost:3000/login?code=abc-123'),
    ).toBe(true)
  })

  it('returns true when error params exist', () => {
    expect(
      hasAuthCallbackParams(
        'http://localhost:3000/login#error=access_denied&error_code=422',
      ),
    ).toBe(true)
  })
})

describe('toLoginErrorMessage', () => {
  it('maps signup-disabled errors to a specific message', () => {
    expect(
      toLoginErrorMessage({
        error: 'access_denied',
        errorCode: 'signup_disabled',
        errorDescription: 'Signups not allowed for this instance',
      }),
    ).toBe('このアカウントではログインできません。')
  })

  it('falls back to a generic message for other errors', () => {
    expect(
      toLoginErrorMessage({
        error: 'server_error',
        errorCode: null,
        errorDescription: 'Unexpected failure',
      }),
    ).toBe('ログインに失敗しました。もう一度お試しください。')
  })

  it('maps 422 and signups-not-allowed description to the blocked message', () => {
    expect(
      toLoginErrorMessage({
        error: 'access_denied',
        errorCode: '422',
        errorDescription: null,
      }),
    ).toBe('このアカウントではログインできません。')

    expect(
      toLoginErrorMessage({
        error: 'access_denied',
        errorCode: null,
        errorDescription: 'Signups not allowed for this instance',
      }),
    ).toBe('このアカウントではログインできません。')
  })
})
