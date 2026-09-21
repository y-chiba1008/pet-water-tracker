import { describe, expect, it } from 'vitest'
import {
  calcWaterAmount,
  checkRecordedAtConsistency,
  isAbnormal,
  isActiveCycle,
} from '@/features/bowl-records/domain/bowlRecord'
import type { BowlRecord } from '@/features/bowl-records/types'

function makeRecord(overrides: Partial<BowlRecord> = {}): BowlRecord {
  return {
    id: 'record-1',
    bowl_id: 'bowl-1',
    start_time: '2026-09-21T00:00:00.000Z',
    start_amount_ml: 240,
    start_recorded_by: 'user-1',
    end_time: null,
    end_amount_ml: null,
    end_recorded_by: null,
    created_at: '2026-09-21T00:00:00.000Z',
    updated_at: '2026-09-21T00:00:00.000Z',
    ...overrides,
  }
}

describe('calcWaterAmount', () => {
  it('returns start minus end', () => {
    expect(calcWaterAmount(240, 100)).toBe(140)
  })

  it('returns a negative value when end exceeds start', () => {
    expect(calcWaterAmount(200, 250)).toBe(-50)
  })

  it('returns the full start amount when end is 0', () => {
    expect(calcWaterAmount(200, 0)).toBe(200)
  })
})

describe('isAbnormal', () => {
  it('is false when end is less than or equal to start', () => {
    expect(isAbnormal(240, 100)).toBe(false)
    expect(isAbnormal(240, 240)).toBe(false)
  })

  it('is true when end exceeds start', () => {
    expect(isAbnormal(200, 250)).toBe(true)
  })
})

describe('isActiveCycle', () => {
  it('is true when end_time is null', () => {
    expect(isActiveCycle(makeRecord({ end_time: null }))).toBe(true)
  })

  it('is false when end_time is set', () => {
    expect(
      isActiveCycle(makeRecord({ end_time: '2026-09-21T12:00:00.000Z' })),
    ).toBe(false)
  })
})

describe('checkRecordedAtConsistency', () => {
  const now = new Date('2026-09-21T12:00:00')

  it('accepts a time between previous and now', () => {
    expect(
      checkRecordedAtConsistency('2026-09-21T10:00', {
        previousAt: '2026-09-21T08:00:00',
        now,
      }),
    ).toEqual({ ok: true })
  })

  it('rejects a time before previous', () => {
    expect(
      checkRecordedAtConsistency('2026-09-21T07:00', {
        previousAt: '2026-09-21T08:00:00',
        now,
      }),
    ).toEqual({ ok: false, reason: 'before_previous' })
  })

  it('rejects a future time', () => {
    expect(
      checkRecordedAtConsistency('2026-09-21T13:00', {
        previousAt: '2026-09-21T08:00:00',
        now,
      }),
    ).toEqual({ ok: false, reason: 'future' })
  })

  it('accepts equal previous and now boundaries', () => {
    expect(
      checkRecordedAtConsistency('2026-09-21T08:00', {
        previousAt: '2026-09-21T08:00:30',
        now: new Date('2026-09-21T08:00:45'),
      }),
    ).toEqual({ ok: true })
  })
})
