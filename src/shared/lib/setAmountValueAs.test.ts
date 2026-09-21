import { describe, expect, it } from 'vitest'
import { setAmountValueAs } from '@/shared/lib/setAmountValueAs'

describe('setAmountValueAs', () => {
  it('converts empty values to undefined', () => {
    expect(setAmountValueAs('')).toBeUndefined()
    expect(setAmountValueAs(Number.NaN)).toBeUndefined()
    expect(setAmountValueAs(undefined)).toBeUndefined()
  })

  it('parses numeric strings and numbers', () => {
    expect(setAmountValueAs('120')).toBe(120)
    expect(setAmountValueAs(40)).toBe(40)
  })
})
