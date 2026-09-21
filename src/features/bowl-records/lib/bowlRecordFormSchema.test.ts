import { describe, expect, it } from 'vitest'
import {
  activeCycleFormSchema,
  noActiveCycleFormSchema,
  setAmountValueAs,
} from '@/features/bowl-records/lib/bowlRecordFormSchema'

describe('noActiveCycleFormSchema', () => {
  it('accepts start amount and datetime', () => {
    const result = noActiveCycleFormSchema.safeParse({
      recordedAt: '2026-09-21T10:00',
      startAmountMl: 250,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing start amount', () => {
    const result = noActiveCycleFormSchema.safeParse({
      recordedAt: '2026-09-21T10:00',
      startAmountMl: undefined,
    })
    expect(result.success).toBe(false)
  })
})

describe('activeCycleFormSchema', () => {
  it('accepts end-only submission', () => {
    const result = activeCycleFormSchema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: 80,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startAmountMl).toBeUndefined()
    }
  })

  it('accepts end and start submission', () => {
    const result = activeCycleFormSchema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: 80,
      startAmountMl: 250,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startAmountMl).toBe(250)
    }
  })

  it('rejects missing end amount', () => {
    const result = activeCycleFormSchema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: undefined,
      startAmountMl: 250,
    })
    expect(result.success).toBe(false)
  })
})

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
