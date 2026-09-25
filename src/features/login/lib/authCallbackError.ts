export type AuthCallbackError = {
  error: string | null
  errorCode: string | null
  errorDescription: string | null
}

/** URL の query / hash から OAuth コールバックエラーを取り出す */
export function parseAuthCallbackError(href: string): AuthCallbackError | null {
  const url = new URL(href)
  const fromSearch = url.searchParams
  const fromHash = new URLSearchParams(
    url.hash.startsWith('#') ? url.hash.slice(1) : url.hash,
  )

  const error = fromSearch.get('error') ?? fromHash.get('error')
  const errorCode = fromSearch.get('error_code') ?? fromHash.get('error_code')
  const errorDescription =
    fromSearch.get('error_description') ?? fromHash.get('error_description')

  if (!error && !errorCode && !errorDescription) {
    return null
  }

  return { error, errorCode, errorDescription }
}

/** URL に OAuth コールバックのパラメータ（エラー・PKCE の認可コード）が残っているか */
export function hasAuthCallbackParams(href: string): boolean {
  return (
    parseAuthCallbackError(href) !== null ||
    new URL(href).searchParams.has('code')
  )
}

/** コールバックエラーをログイン画面向けの文言に変換する */
export function toLoginErrorMessage(callbackError: AuthCallbackError): string {
  const code = (callbackError.errorCode ?? '').toLowerCase()
  const description = (callbackError.errorDescription ?? '').toLowerCase()

  if (
    code === 'signup_disabled' ||
    code === '422' ||
    description.includes('signups not allowed')
  ) {
    return 'このアカウントではログインできません。'
  }

  return 'ログインに失敗しました。もう一度お試しください。'
}
