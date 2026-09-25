import { useState } from 'react'
import { formatClockTime } from '@/shared/lib/dateTime'
import { AppShell } from '@/shared/components/AppShell'
import { CalendarView } from '@/features/visualization/components/CalendarView'
import { LineChartView } from '@/features/visualization/components/LineChartView'
import { SummaryCards } from '@/features/visualization/components/SummaryCards'
import { ViewSwitcher } from '@/features/visualization/components/ViewSwitcher'
import {
  isFutureYearMonth,
  shiftYearMonth,
} from '@/features/visualization/domain/dailySummary'
import { useDailySummary } from '@/features/visualization/hooks/useDailySummary'
import type { HomeViewMode } from '@/features/visualization/types'
import {
  FetchErrorMessage,
  LoadingMessage,
} from '@/shared/components/QueryStatusMessage'

function initialYearMonth(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export function HomePage() {
  const [mode, setMode] = useState<HomeViewMode>('calendar')
  const [calendarMonth, setCalendarMonth] = useState(initialYearMonth)
  const { data, isLoading, isError, refetch, isFetching } = useDailySummary(
    calendarMonth.year,
    calendarMonth.month,
  )

  const nextMonth = shiftYearMonth(calendarMonth.year, calendarMonth.month, 1)
  const canGoNext = !isFutureYearMonth(nextMonth.year, nextMonth.month)

  return (
    <AppShell title="ホーム">
      <div className="flex flex-col gap-4 pb-4">
        {isLoading ? <LoadingMessage className="pt-12" /> : null}

        {isError ? (
          <FetchErrorMessage
            className="pt-12"
            message="集計データの取得に失敗しました。もう一度お試しください。"
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        ) : null}

        {data ? (
          <>
            <SummaryCards
              todayAmountMl={data.todayAmountMl}
              latestRecordedAtLabel={
                data.latestRecordedAt
                  ? formatClockTime(data.latestRecordedAt)
                  : null
              }
              monthAverageMl={data.monthAverageMl}
              monthRecordedDays={data.monthRecordedDays}
            />

            <ViewSwitcher mode={mode} onChange={setMode} />

            {mode === 'calendar' ? (
              <CalendarView
                year={calendarMonth.year}
                month={calendarMonth.month}
                dailyAmounts={data.dailyAmounts}
                canGoNext={canGoNext}
                onPrevMonth={() =>
                  setCalendarMonth((current) =>
                    shiftYearMonth(current.year, current.month, -1),
                  )
                }
                onNextMonth={() => {
                  if (!canGoNext) return
                  setCalendarMonth((current) =>
                    shiftYearMonth(current.year, current.month, 1),
                  )
                }}
                onGoToCurrentMonth={() => setCalendarMonth(initialYearMonth())}
              />
            ) : (
              <LineChartView
                series={data.chartSeries}
                extremes={data.chartExtremes}
              />
            )}
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
