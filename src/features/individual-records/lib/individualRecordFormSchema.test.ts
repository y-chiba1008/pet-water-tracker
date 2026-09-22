import { describe, expect, it } from 'vitest'
import { createIndividualRecordFormSchema } from '@/features/individual-records/lib/individualRecordFormSchema'

const now = new Date('2026-09-22T12:00:00')

describe('createIndividualRecordFormSchema', () => {
  it('accepts amount and datetime within range', () => {
    const schema = createIndividualRecordFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-22T10:00',
      amountMl: 15,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing amount', () => {
    const schema = createIndividualRecordFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-22T10:00',
      amountMl: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const schema = createIndividualRecordFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-22T10:00',
      amountMl: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects amount over 500', () => {
    const schema = createIndividualRecordFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-22T10:00',
      amountMl: 501,
    })
    expect(result.success).toBe(false)
  })

  it('rejects future datetime', () => {
    const schema = createIndividualRecordFormSchema({ now })
    const result = schema.safeParse({
      recordedAt: '2026-09-22T13:00',
      amountMl: 15,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        '現在時刻以前の日時を入力してください。',
      )
    }
  })

  it('rejects empty or invalid datetime', () => {
    const schema = createIndividualRecordFormSchema({ now })

    expect(
      schema.safeParse({
        recordedAt: '',
        amountMl: 15,
      }).success,
    ).toBe(false)

    expect(
      schema.safeParse({
        recordedAt: 'not-a-date',
        amountMl: 15,
      }).success,
    ).toBe(false)
  })
})
