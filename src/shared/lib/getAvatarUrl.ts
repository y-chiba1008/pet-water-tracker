import type { User } from '@supabase/supabase-js'

function pickAvatarUrl(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined
  for (const key of ['avatar_url', 'picture'] as const) {
    const value = data[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return undefined
}

/** Google SSO などからプロフィール画像 URL を取得する */
export function getAvatarUrl(user: User | null | undefined): string | undefined {
  if (!user) return undefined

  const fromMetadata = pickAvatarUrl(user.user_metadata)
  if (fromMetadata) return fromMetadata

  for (const identity of user.identities ?? []) {
    const fromIdentity = pickAvatarUrl(identity.identity_data)
    if (fromIdentity) return fromIdentity
  }

  return undefined
}
