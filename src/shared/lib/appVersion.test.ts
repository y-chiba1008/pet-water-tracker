import { describe, expect, it } from 'vitest'
import { version as packageVersion } from '../../../package.json'
import { APP_VERSION } from '@/shared/lib/appVersion'

describe('APP_VERSION', () => {
  it('matches package.json version', () => {
    expect(APP_VERSION).toBe(packageVersion)
  })
})
