import { useState } from 'react'
import { signOut } from '@/features/auth/api/authRepository'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'

/** 認証後画面の仮置き。可視化（issue 別）実装までのプレースホルダ */
export function HomePlaceholderPage() {
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-6 px-4">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          ホーム
        </h1>
        <p className="text-sm text-muted-foreground">
          ログイン済みです。可視化画面は今後実装予定です。
        </p>
        {user?.email ? (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
      >
        {isSigningOut ? 'ログアウト中…' : 'ログアウト'}
      </Button>
    </main>
  )
}
