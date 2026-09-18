import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'

function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
      読み込み中…
    </div>
  )
}

/** 未認証ユーザーを /login へ誘導する */
export function RequireAuth() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <AuthLoading />
  }

  if (!session) {
    return (
      <Navigate
        to={{
          pathname: '/login',
          search: location.search,
          hash: location.hash,
        }}
        replace
      />
    )
  }

  return <Outlet />
}

/** 認証済みユーザーをホームへ誘導する（ログイン画面用） */
export function GuestOnly() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <AuthLoading />
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
