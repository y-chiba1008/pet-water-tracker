import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fetchSummaryRecords } from '@/features/visualization/api/summaryRepository'
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

export const dailySummaryQueryKey = ['visualization', 'daily-summary'] as const

export type DailySummaryViewModel = {
  dailyAmounts: Map<string, number>
  todayAmountMl: number
  latestRecordedAt: string | null
  monthAverageMl: number | null
  monthRecordedDays: number
  chartSeries: { date: string; amountMl: number }[]
  chartExtremes: { maxMl: number; minMl: number } | null
}

function buildViewModel(
  records: Awaited<ReturnType<typeof fetchSummaryRecords>>,
  now: Date,
): DailySummaryViewModel {
  const completedBowls = records.bowlRecords.flatMap((record) => {
    if (record.end_time == null || record.end_amount_ml == null) {
      return []
    }
    return [
      {
        end_time: record.end_time,
        start_amount_ml: record.start_amount_ml,
        end_amount_ml: record.end_amount_ml,
      },
    ]
  })

  const dailyAmounts = aggregateDailyAmounts(
    completedBowls,
    records.individualRecords.map((record) => ({
      recorded_at: record.recorded_at,
      amount_ml: record.amount_ml,
    })),
  )

  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthStats = calcMonthStats(dailyAmounts, year, month, now)
  const chartSeries = buildDailySeries(dailyAmounts, getChartRange(now))

  const latestRecordedAt = findLatestRecordedAt([
    ...completedBowls.map((record) => ({ at: record.end_time })),
    ...records.individualRecords.map((record) => ({
      at: record.recorded_at,
    })),
  ])

  return {
    dailyAmounts,
    todayAmountMl: dailyAmounts.get(toLocalDateKey(now)) ?? 0,
    latestRecordedAt,
    monthAverageMl: monthStats.averageMl,
    monthRecordedDays: monthStats.recordedDays,
    chartSeries,
    chartExtremes: calcSeriesExtremes(chartSeries),
  }
}

export function useDailySummary(calendarYear: number, calendarMonth: number) {
  const todayKey = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: [
      ...dailySummaryQueryKey,
      todayKey,
      calendarYear,
      calendarMonth,
    ],
    queryFn: async () => {
      const now = new Date()
      const fetchRange = getSummaryFetchRange(
        now,
        calendarYear,
        calendarMonth,
      )
      const records = await fetchSummaryRecords({
        fromIso: fetchRange.start.toISOString(),
        toIso: fetchRange.end.toISOString(),
      })
      return buildViewModel(records, now)
    },
    placeholderData: keepPreviousData,
  })
}
