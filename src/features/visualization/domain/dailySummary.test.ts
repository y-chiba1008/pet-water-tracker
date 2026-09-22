import { describe, expect, it } from 'vitest'
import {
  aggregateDailyAmounts,
  buildDailySeries,
  calcMonthStats,
  calcSeriesExtremes,
  findLatestRecordedAt,
  getChartRange,
  getSummaryFetchRange,
  toLocalDateKey,
} from '@/features/visualization/domain/dailySummary'

describe('toLocalDateKey', () => {
  it('formats a Date as yyyy-MM-dd in local time', () => {
    expect(toLocalDateKey(new Date(2026, 8, 22, 15, 30))).toBe('2026-09-22')
  })
})

describe('aggregateDailyAmounts', () => {
  it('sums bowl water by end_time date and individual by recorded_at date', () => {
    const totals = aggregateDailyAmounts(
      [
        {
          end_time: new Date(2026, 8, 22, 10, 0).toISOString(),
          start_amount_ml: 240,
          end_amount_ml: 100,
        },
        {
          end_time: new Date(2026, 8, 22, 18, 0).toISOString(),
          start_amount_ml: 200,
          end_amount_ml: 150,
        },
      ],
      [
        {
          recorded_at: new Date(2026, 8, 22, 12, 0).toISOString(),
          amount_ml: 20,
        },
        {
          recorded_at: new Date(2026, 8, 21, 9, 0).toISOString(),
          amount_ml: 30,
        },
      ],
    )

    expect(totals.get('2026-09-22')).toBe(140 + 50 + 20)
    expect(totals.get('2026-09-21')).toBe(30)
  })

  it('keeps a zero amount day key when start equals end', () => {
    const totals = aggregateDailyAmounts(
      [
        {
          end_time: new Date(2026, 8, 22, 10, 0).toISOString(),
          start_amount_ml: 100,
          end_amount_ml: 100,
        },
      ],
      [],
    )

    expect(totals.get('2026-09-22')).toBe(0)
    expect(totals.has('2026-09-22')).toBe(true)
  })
})

describe('buildDailySeries', () => {
  it('fills missing days with 0', () => {
    const totals = new Map([['2026-09-21', 40]])
    const series = buildDailySeries(totals, {
      start: new Date(2026, 8, 21),
      end: new Date(2026, 8, 23),
    })

    expect(series).toEqual([
      { date: '2026-09-21', amountMl: 40 },
      { date: '2026-09-22', amountMl: 0 },
      { date: '2026-09-23', amountMl: 0 },
    ])
  })
})

describe('getChartRange', () => {
  it('returns 30 days ending today inclusive', () => {
    const now = new Date(2026, 8, 22, 15, 0)
    const { start, end } = getChartRange(now)

    expect(toLocalDateKey(start)).toBe('2026-08-24')
    expect(toLocalDateKey(end)).toBe('2026-09-22')
  })
})

describe('getSummaryFetchRange', () => {
  it('covers both the current month and the chart window', () => {
    const earlyMonth = new Date(2026, 8, 5, 12, 0)
    const { start, end } = getSummaryFetchRange(earlyMonth)
    expect(toLocalDateKey(start)).toBe('2026-08-07')
    expect(toLocalDateKey(end)).toBe('2026-09-30')

    const lateMonth = new Date(2026, 8, 28, 12, 0)
    const late = getSummaryFetchRange(lateMonth)
    expect(toLocalDateKey(late.start)).toBe('2026-08-30')
    expect(toLocalDateKey(late.end)).toBe('2026-09-30')
  })
})

describe('calcMonthStats', () => {
  it('averages only days that have records in the month', () => {
    const totals = new Map([
      ['2026-09-01', 100],
      ['2026-09-02', 200],
      ['2026-08-31', 999],
    ])

    expect(calcMonthStats(totals, 2026, 9)).toEqual({
      averageMl: 150,
      recordedDays: 2,
    })
  })

  it('returns null average when no recorded days', () => {
    expect(calcMonthStats(new Map(), 2026, 9)).toEqual({
      averageMl: null,
      recordedDays: 0,
    })
  })
})

describe('calcSeriesExtremes', () => {
  it('ignores zero days', () => {
    expect(
      calcSeriesExtremes([
        { date: '2026-09-01', amountMl: 0 },
        { date: '2026-09-02', amountMl: 130 },
        { date: '2026-09-03', amountMl: 175 },
      ]),
    ).toEqual({ maxMl: 175, minMl: 130 })
  })

  it('returns null when all days are zero', () => {
    expect(
      calcSeriesExtremes([{ date: '2026-09-01', amountMl: 0 }]),
    ).toBeNull()
  })
})

describe('findLatestRecordedAt', () => {
  it('returns the newest timestamp', () => {
    expect(
      findLatestRecordedAt([
        { at: '2026-09-21T10:00:00.000Z' },
        { at: '2026-09-22T09:00:00.000Z' },
        { at: '2026-09-20T20:00:00.000Z' },
      ]),
    ).toBe('2026-09-22T09:00:00.000Z')
  })

  it('returns null for an empty list', () => {
    expect(findLatestRecordedAt([])).toBeNull()
  })
})
