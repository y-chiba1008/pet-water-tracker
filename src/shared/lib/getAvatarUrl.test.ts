import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { getAvatarUrl } from '@/shared/lib/getAvatarUrl'

function userStub(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as User
}

describe('getAvatarUrl', () => {
  it('returns undefined when user is null', () => {
    expect(getAvatarUrl(null)).toBeUndefined()
  })

  it('prefers user_metadata.avatar_url', () => {
    const user = userStub({
      user_metadata: {
        avatar_url: 'https://example.com/avatar.png',
        picture: 'https://example.com/picture.png',
      },
    })
    expect(getAvatarUrl(user)).toBe('https://example.com/avatar.png')
  })

  it('falls back to user_metadata.picture', () => {
    const user = userStub({
      user_metadata: { picture: 'https://example.com/picture.png' },
    })
    expect(getAvatarUrl(user)).toBe('https://example.com/picture.png')
  })

  it('falls back to identity_data when metadata has no avatar', () => {
    const user = userStub({
      identities: [
        {
          identity_id: 'id-1',
          id: 'id-1',
          user_id: 'user-1',
          identity_data: { picture: 'https://example.com/from-identity.png' },
          provider: 'google',
          last_sign_in_at: '2026-01-01T00:00:00.000Z',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    expect(getAvatarUrl(user)).toBe('https://example.com/from-identity.png')
  })

  it('ignores empty strings', () => {
    const user = userStub({
      user_metadata: { avatar_url: '', picture: '' },
      identities: [
        {
          identity_id: 'id-1',
          id: 'id-1',
          user_id: 'user-1',
          identity_data: { avatar_url: '' },
          provider: 'google',
          last_sign_in_at: '2026-01-01T00:00:00.000Z',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    expect(getAvatarUrl(user)).toBeUndefined()
  })
})
