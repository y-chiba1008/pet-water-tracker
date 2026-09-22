import { describe, expect, it } from 'vitest'
import { setAmountValueAs } from '@/shared/lib/setAmountValueAs'

describe('setAmountValueAs', () => {
  it('converts empty values to undefined', () => {
    expect(setAmountValueAs('')).toBeUndefined()
    expect(setAmountValueAs('   ')).toBeUndefined()
    expect(setAmountValueAs(null)).toBeUndefined()
    expect(setAmountValueAs(undefined)).toBeUndefined()
    expect(setAmountValueAs(Number.NaN)).toBeUndefined()
  })

  it('parses numeric strings and numbers', () => {
    expect(setAmountValueAs('120')).toBe(120)
    expect(setAmountValueAs(' 40 ')).toBe(40)
    expect(setAmountValueAs(40)).toBe(40)
  })

  it('returns undefined for non-numeric input', () => {
    expect(setAmountValueAs('abc')).toBeUndefined()
    expect(setAmountValueAs({})).toBeUndefined()
    expect(setAmountValueAs([])).toBeUndefined()
  })
})
