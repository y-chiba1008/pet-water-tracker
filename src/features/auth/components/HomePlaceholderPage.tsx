import { useState } from 'react'
import { Link } from 'react-router'
import { User } from 'lucide-react'
import { signOut } from '@/features/auth/api/authRepository'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppShell } from '@/shared/components/AppShell'
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
    <AppShell
      title="ホーム"
      headerAction={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-full bg-[#006591] text-white hover:bg-[#004c6e] hover:text-white"
          aria-label={isSigningOut ? 'ログアウト中' : 'ログアウト'}
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
        >
          <User className="size-4" />
        </Button>
      }
    >
      <div className="flex flex-col gap-6 pt-6">
        <div className="space-y-2">
          <p className="text-sm text-[#78716C]">
            ログイン済みです。可視化画面は今後実装予定です。
          </p>
          {user?.email ? (
            <p className="text-sm text-[#78716C]">{user.email}</p>
          ) : null}
        </div>

        <Button
          type="button"
          asChild
          className="h-12 rounded-full bg-[#0EA5E9] text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7]"
        >
          <Link to="/bowls">水皿管理へ</Link>
        </Button>
      </div>
    </AppShell>
  )
}
