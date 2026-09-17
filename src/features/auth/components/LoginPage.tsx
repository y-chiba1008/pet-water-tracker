import { useState } from 'react'
import { signInWithGoogle } from '@/features/auth/api/authRepository'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            pet-water-tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Googleアカウントでログインしてください
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          onClick={() => void handleGoogleLogin()}
        >
          {isSubmitting ? 'リダイレクト中…' : 'Googleでログイン'}
        </Button>

        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </main>
  )
}
