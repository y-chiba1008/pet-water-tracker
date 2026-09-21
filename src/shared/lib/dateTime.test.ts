import { describe, expect, it } from 'vitest'
import {
  formatElapsedLabel,
  formatExchangeElapsedLabel,
  formatLatestCompletedAtLabel,
} from '@/shared/lib/dateTime'

describe('formatElapsedLabel', () => {
  it('formats minutes, hours, and days with 約 prefix', () => {
    const now = new Date('2026-09-21T12:00:00')

    expect(
      formatElapsedLabel(new Date('2026-09-21T11:30:00').toISOString(), now),
    ).toBe('約30分')
    expect(
      formatElapsedLabel(new Date('2026-09-21T04:00:00').toISOString(), now),
    ).toBe('約8時間')
    expect(
      formatElapsedLabel(new Date('2026-09-19T12:00:00').toISOString(), now),
    ).toBe('約2日')
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
  it('uses 本日 when the end time is today', () => {
    const now = new Date('2026-09-21T18:00:00')

    expect(
      formatLatestCompletedAtLabel(
        new Date('2026-09-21T11:30:00').toISOString(),
        now,
      ),
    ).toBe('直近の完了: 本日 11:30')
  })

  it('uses month/day when the end time is on another day', () => {
    const now = new Date('2026-09-21T18:00:00')

    expect(
      formatLatestCompletedAtLabel(
        new Date('2026-09-18T11:30:00').toISOString(),
        now,
      ),
    ).toBe('直近の完了: 9/18 11:30')
  })
})
