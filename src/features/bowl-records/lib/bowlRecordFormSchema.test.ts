import { describe, expect, it } from 'vitest'
import {
  createActiveCycleFormSchema,
  createNoActiveCycleFormSchema,
} from '@/features/bowl-records/lib/bowlRecordFormSchema'

const now = new Date('2026-09-21T12:00:00')

describe('createNoActiveCycleFormSchema', () => {
  it('accepts start amount and datetime within range', () => {
    const schema = createNoActiveCycleFormSchema({
      previousAt: '2026-09-21T08:00:00',
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      startAmountMl: 250,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing start amount', () => {
    const schema = createNoActiveCycleFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      startAmountMl: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('rejects datetime before previous recorded time', () => {
    const schema = createNoActiveCycleFormSchema({
      previousAt: '2026-09-21T11:00:00',
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      startAmountMl: 250,
    })
    expect(result.success).toBe(false)
  })

  it('rejects future datetime', () => {
    const schema = createNoActiveCycleFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T13:00',
      startAmountMl: 250,
    })
    expect(result.success).toBe(false)
  })
})

describe('createActiveCycleFormSchema', () => {
  const previousAt = '2026-09-21T08:00:00'

  it('accepts end-only submission', () => {
    const schema = createActiveCycleFormSchema({
      previousAt,
      startAmountMl: 240,
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: 80,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startAmountMl).toBeUndefined()
    }
  })

  it('accepts end and start submission', () => {
    const schema = createActiveCycleFormSchema({
      previousAt,
      startAmountMl: 240,
      now,
    })
    const result = schema.safeParse({
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
    const schema = createActiveCycleFormSchema({
      previousAt,
      startAmountMl: 240,
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: undefined,
      startAmountMl: 250,
    })
    expect(result.success).toBe(false)
  })

  it('rejects abnormal end amount greater than start', () => {
    const schema = createActiveCycleFormSchema({
      previousAt,
      startAmountMl: 200,
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: 250,
    })
    expect(result.success).toBe(false)
  })

  it('rejects datetime before previous start time', () => {
    const schema = createActiveCycleFormSchema({
      previousAt: '2026-09-21T11:00:00',
      startAmountMl: 240,
      now,
    })
    const result = schema.safeParse({
      recordedAt: '2026-09-21T10:00',
      endAmountMl: 80,
    })
    expect(result.success).toBe(false)
  })
})
