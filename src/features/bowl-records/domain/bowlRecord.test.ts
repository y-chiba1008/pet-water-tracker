import { describe, expect, it } from 'vitest'
import {
  calcWaterAmount,
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
