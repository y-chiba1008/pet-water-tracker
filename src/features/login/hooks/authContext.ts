import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  /** 初回セッション確認に失敗した際のエラーメッセージ */
  sessionError: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
