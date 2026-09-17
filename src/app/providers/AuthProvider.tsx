import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { getSession } from '@/features/auth/api/authRepository'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { supabase } from '@/shared/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const onSessionChange = useEffectEvent((next: Session | null) => {
    setSession(next)
    setIsLoading(false)
  })

  useEffect(() => {
    let cancelled = false

    void getSession()
      .then((initialSession) => {
        if (!cancelled) {
          onSessionChange(initialSession)
        }
      })
      .catch(() => {
        if (!cancelled) {
          onSessionChange(null)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      onSessionChange(nextSession)
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
      }}
    >
      {children}
    </AuthContext>
  )
}
