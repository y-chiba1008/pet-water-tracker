import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns'
import { calcWaterAmount } from '@/features/bowl-records/domain/bowlRecord'

export type DailyAmount = {
  /** ローカル日付キー (yyyy-MM-dd) */
  date: string
  amountMl: number
}

export type CompletedBowlRecordForSummary = {
  end_time: string
  start_amount_ml: number
  end_amount_ml: number
}

export type IndividualRecordForSummary = {
  recorded_at: string
  amount_ml: number
}

/** ISO 日時をローカル日付キー (yyyy-MM-dd) に変換する */
export function toLocalDateKey(isoOrDate: string | Date): string {
  const date =
    typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return format(date, 'yyyy-MM-dd')
}

/**
 * 水皿記録（終了日）と個別記録を日別に合算する。
 * 進行中サイクル（呼び出し側で除外）は含めない。
 */
export function aggregateDailyAmounts(
  bowlRecords: CompletedBowlRecordForSummary[],
  individualRecords: IndividualRecordForSummary[],
): Map<string, number> {
  const totals = new Map<string, number>()

  for (const record of bowlRecords) {
    const key = toLocalDateKey(record.end_time)
    const amount = calcWaterAmount(
      record.start_amount_ml,
      record.end_amount_ml,
    )
    totals.set(key, (totals.get(key) ?? 0) + amount)
  }

  for (const record of individualRecords) {
    const key = toLocalDateKey(record.recorded_at)
    totals.set(key, (totals.get(key) ?? 0) + record.amount_ml)
  }

  return totals
}

/** 指定期間の全日について日別合計を並べる（記録なしは 0） */
export function buildDailySeries(
  dailyAmounts: Map<string, number>,
  range: { start: Date; end: Date },
): DailyAmount[] {
  return eachDayOfInterval({
    start: startOfDay(range.start),
    end: startOfDay(range.end),
  }).map((day) => {
    const date = toLocalDateKey(day)
    return {
      date,
      amountMl: dailyAmounts.get(date) ?? 0,
    }
  })
}

/**
 * 折れ線グラフ用の期間（直近30日・今日含む）。
 * 例: 9/22 なら 8/24〜9/22
 */
export function getChartRange(now: Date = new Date()): {
  start: Date
  end: Date
} {
  return {
    start: startOfDay(subDays(now, 29)),
    end: endOfDay(now),
  }
}

/** カレンダー表示用の当月レンジ */
export function getMonthRange(
  year: number,
  month: number,
): { start: Date; end: Date } {
  const anchor = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
  }
}

/**
 * データ取得に必要な全体レンジ（表示カレンダー月 + 直近30日グラフ）
 */
export function getSummaryFetchRange(
  now: Date = new Date(),
  calendarYear: number = now.getFullYear(),
  calendarMonth: number = now.getMonth() + 1,
): {
  start: Date
  end: Date
} {
  const chart = getChartRange(now)
  const month = getMonthRange(calendarYear, calendarMonth)
  return {
    start: chart.start < month.start ? chart.start : month.start,
    end: chart.end > month.end ? chart.end : month.end,
  }
}

/** 年月を delta ヶ月ずらす（month は 1–12） */
export function shiftYearMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

/** 指定年月が now の当月かどうか */
export function isCurrentYearMonth(
  year: number,
  month: number,
  now: Date = new Date(),
): boolean {
  return year === now.getFullYear() && month === now.getMonth() + 1
}

/** 指定年月が now の当月より未来かどうか */
export function isFutureYearMonth(
  year: number,
  month: number,
  now: Date = new Date(),
): boolean {
  if (year > now.getFullYear()) return true
  if (year < now.getFullYear()) return false
  return month > now.getMonth() + 1
}

/** 今月の記録がある日だけの1日平均と記録日数 */
export function calcMonthStats(
  dailyAmounts: Map<string, number>,
  year: number,
  month: number,
): { averageMl: number | null; recordedDays: number } {
  const { start, end } = getMonthRange(year, month)
  let sum = 0
  let recordedDays = 0

  for (const day of eachDayOfInterval({ start, end })) {
    const amount = dailyAmounts.get(toLocalDateKey(day))
    if (amount === undefined) continue
    sum += amount
    recordedDays += 1
  }

  if (recordedDays === 0) {
    return { averageMl: null, recordedDays: 0 }
  }

  return {
    averageMl: Math.round(sum / recordedDays),
    recordedDays,
  }
}

/** 記録ありの日だけから最高・最低を求める（なければ null） */
export function calcSeriesExtremes(
  series: DailyAmount[],
): { maxMl: number; minMl: number } | null {
  const recorded = series.filter((day) => day.amountMl !== 0)
  if (recorded.length === 0) {
    return null
  }

  let maxMl = recorded[0].amountMl
  let minMl = recorded[0].amountMl
  for (const day of recorded.slice(1)) {
    if (day.amountMl > maxMl) maxMl = day.amountMl
    if (day.amountMl < minMl) minMl = day.amountMl
  }
  return { maxMl, minMl }
}

export type TimestampedRecord = {
  at: string
}

/** 最も新しい記録時刻（ISO）を返す */
export function findLatestRecordedAt(
  records: TimestampedRecord[],
): string | null {
  let latest: string | null = null
  let latestMs = -Infinity

  for (const record of records) {
    const ms = new Date(record.at).getTime()
    if (Number.isNaN(ms)) continue
    if (ms > latestMs) {
      latestMs = ms
      latest = record.at
    }
  }

  return latest
}
