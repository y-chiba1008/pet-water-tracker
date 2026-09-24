import { supabase } from '@/shared/lib/supabaseClient'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getSession() {
  // OAuth コールバック（PKCE のコード交換）の失敗は getSession() では
  // エラーにならず session: null になるため、初期化結果から拾う
  const { error: initError } = await supabase.auth.initialize()

  if (initError) {
    throw initError
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}
