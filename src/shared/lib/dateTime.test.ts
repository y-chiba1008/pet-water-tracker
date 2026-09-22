import { describe, expect, it } from 'vitest'
import {
  dateTimeLocalToIso,
  formatClockTime,
  formatElapsedLabel,
  formatExchangeElapsedLabel,
  formatLatestCompletedAtLabel,
  toDateTimeLocalValue,
  truncateToMinute,
} from '@/shared/lib/dateTime'

describe('toDateTimeLocalValue', () => {
  it('formats a Date as YYYY-MM-DDTHH:mm', () => {
    expect(toDateTimeLocalValue(new Date(2026, 8, 21, 9, 5))).toBe(
      '2026-09-21T09:05',
    )
  })
})

describe('dateTimeLocalToIso', () => {
  it('converts a datetime-local value to ISO', () => {
    expect(dateTimeLocalToIso('2026-09-21T10:00')).toBe(
      new Date('2026-09-21T10:00').toISOString(),
    )
  })
})

describe('truncateToMinute', () => {
  it('clears seconds and milliseconds', () => {
    const truncated = truncateToMinute(new Date('2026-09-21T10:00:45.123'))
    expect(truncated.getSeconds()).toBe(0)
    expect(truncated.getMilliseconds()).toBe(0)
  })
})

describe('formatClockTime', () => {
  it('formats HH:mm from an ISO timestamp', () => {
    expect(formatClockTime(new Date(2026, 8, 21, 11, 30).toISOString())).toBe(
      '11:30',
    )
  })
})

describe('formatElapsedLabel', () => {
  it('formats minutes, hours, and days without 約 prefix', () => {
    const now = new Date('2026-09-21T12:00:00')

    expect(
      formatElapsedLabel(new Date('2026-09-21T11:30:00').toISOString(), now),
    ).toBe('30分')
    expect(
      formatElapsedLabel(new Date('2026-09-21T04:00:00').toISOString(), now),
    ).toBe('8時間')
    expect(
      formatElapsedLabel(new Date('2026-09-19T12:00:00').toISOString(), now),
    ).toBe('2日')
  })

  it('uses at least 1 minute for very recent times', () => {
    const now = new Date('2026-09-21T12:00:00')
    expect(
      formatElapsedLabel(new Date('2026-09-21T12:00:00').toISOString(), now),
    ).toBe('1分')
  })

  it('includes remaining minutes when hours are not exact', () => {
    const now = new Date('2026-09-21T12:30:00')
    expect(
      formatElapsedLabel(new Date('2026-09-21T10:00:00').toISOString(), now),
    ).toBe('2時間30分')
  })
})

describe('formatExchangeElapsedLabel', () => {
  it('formats elapsed time for bowl list cards', () => {
    const now = new Date('2026-09-21T12:00:00')

    expect(
      formatExchangeElapsedLabel(
        new Date('2026-09-21T04:00:00').toISOString(),
        now,
      ),
    ).toBe('交換から8時間経過')
  })
})

describe('formatLatestCompletedAtLabel', () => {
  it('uses 今日 when the end time is today', () => {
    const now = new Date('2026-09-21T18:00:00')

    expect(
      formatLatestCompletedAtLabel(
        new Date('2026-09-21T11:30:00').toISOString(),
        now,
      ),
    ).toBe('前回の記録: 今日 11:30')
  })

  it('uses month/day when the end time is on another day', () => {
    const now = new Date('2026-09-21T18:00:00')

    expect(
      formatLatestCompletedAtLabel(
        new Date('2026-09-18T11:30:00').toISOString(),
        now,
      ),
    ).toBe('前回の記録: 9/18 11:30')
  })
})
