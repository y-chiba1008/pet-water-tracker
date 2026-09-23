import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { signInWithGoogle } from '@/features/login/api/authRepository'
import {
  parseAuthCallbackError,
  toLoginErrorMessage,
} from '@/features/login/lib/authCallbackError'
import { APP_VERSION } from '@/shared/lib/appVersion'
import { Button } from '@/components/ui/button'
import googleGLogoLight from '@/assets/google-g-logo-light.svg'
import icon from '@/assets/icon.png'

function readCallbackErrorMessage(): string | null {
  const callbackError = parseAuthCallbackError(window.location.href)
  return callbackError ? toLoginErrorMessage(callbackError) : null
}

export function LoginPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    readCallbackErrorMessage,
  )

  useEffect(() => {
    if (!parseAuthCallbackError(window.location.href)) {
      return
    }

    // 表示用にメッセージは state に残し、URL からはエラーパラメータを除去する
    void navigate('/login', { replace: true })
  }, [navigate])

  async function handleGoogleLogin() {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await signInWithGoogle()
    } catch {
      setErrorMessage('ログインに失敗しました。もう一度お試しください。')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#fff8f5] selection:bg-[#E0F2FE] selection:text-[#006591]">
      <div className="relative mx-auto flex min-h-svh w-full max-w-[390px] flex-col items-center justify-between overflow-hidden px-4 py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 -z-10 size-96 rounded-full bg-[#E0F2FE]/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-96 rounded-full bg-[#FFEDD5]/60 blur-3xl"
        />

        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="group relative mb-6">
            <div
              aria-hidden
              className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#38BDF8]/30 to-[#ffb690]/40 blur-md transition-all duration-300 group-hover:blur-lg"
            />
            <div className="relative flex size-24 items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_24px_rgba(120,113,108,0.12)]">
              <img
                src={icon}
                alt="猫の飲水量記録"
                className="size-full rounded-full object-contain"
              />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-heading mb-1 text-[22px] leading-[30px] font-semibold tracking-tight text-[#292524] sm:text-[28px] sm:leading-[36px]">
              猫の飲水量記録
            </h1>
            <p className="text-sm leading-[22px] text-[#78716C]">
              日々の飲水量をやさしく見守る
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 rounded-xl border border-[#E7DFD8]/60 bg-white p-6 shadow-[0_12px_32px_-4px_rgba(120,113,108,0.1)]">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-14 w-full gap-4 rounded-full border-[#E7DFD8] bg-white px-4 text-base font-semibold text-[#292524] shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:bg-[#F5EFEB] hover:text-[#006591] active:scale-[0.98]"
                disabled={isSubmitting}
                onClick={() => void handleGoogleLogin()}
              >
                <img
                  src={googleGLogoLight}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
                Google でログイン
              </Button>

              {isSubmitting ? (
                <div className="animate-pulse rounded-full bg-[#E0F2FE] px-2 py-1 text-center text-[11px] leading-[14px] font-medium tracking-wide text-[#0284C7]">
                  認証画面へリダイレクト中…
                </div>
              ) : null}

              {errorMessage ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-center text-[11px] leading-[14px] font-medium tracking-wide text-[#78716C]">
            愛猫の水分補給管理を、もっとシンプルに。
          </p>
          <p className="text-center text-[11px] leading-[14px] font-medium tracking-wide text-[#A8A29E]">
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </main>
  )
}
