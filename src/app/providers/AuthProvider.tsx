import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { getSession } from '@/features/login/api/authRepository'
import { AuthContext } from '@/features/login/hooks/authContext'
import { supabase } from '@/shared/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const onInitialSession = useEffectEvent((next: Session | null) => {
    setSession(next)
    setIsLoading(false)
    setSessionError(null)
  })

  const onSessionFetchError = useEffectEvent(() => {
    setSession(null)
    setIsLoading(false)
    setSessionError('ログインに失敗しました。もう一度お試しください。')
  })

  const onAuthStateChange = useEffectEvent((next: Session | null) => {
    setSession(next)
    setIsLoading(false)
    // 認証成功時のみエラーを消す。null 通知では sessionError を残す
    if (next !== null) {
      setSessionError(null)
    }
  })

  useEffect(() => {
    let cancelled = false

    void getSession()
      .then((initialSession) => {
        if (!cancelled) {
          onInitialSession(initialSession)
        }
      })
      .catch(() => {
        if (!cancelled) {
          onSessionFetchError()
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      onAuthStateChange(nextSession)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        sessionError,
      }}
    >
      {children}
    </AuthContext>
  )
}
