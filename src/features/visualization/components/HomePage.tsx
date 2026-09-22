import { useState } from 'react'
import { formatClockTime } from '@/shared/lib/dateTime'
import { AppShell } from '@/shared/components/AppShell'
import { CalendarView } from '@/features/visualization/components/CalendarView'
import { LineChartView } from '@/features/visualization/components/LineChartView'
import { SummaryCards } from '@/features/visualization/components/SummaryCards'
import { ViewSwitcher } from '@/features/visualization/components/ViewSwitcher'
import { useDailySummary } from '@/features/visualization/hooks/useDailySummary'
import type { HomeViewMode } from '@/features/visualization/types'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const [mode, setMode] = useState<HomeViewMode>('calendar')
  const { data, isLoading, isError, refetch, isFetching } = useDailySummary()

  return (
    <AppShell title="ホーム">
      <div className="flex flex-col gap-4 pb-4">
        {isLoading ? (
          <p className="pt-6 text-sm text-[#78716C]">読み込み中…</p>
        ) : null}

        {isError ? (
          <div className="flex flex-col gap-3 pt-6">
            <p className="text-sm text-[#ba1a1a]">
              集計データの取得に失敗しました。時間をおいて再度お試しください。
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="h-12 rounded-full border-[#E7DFD8] bg-[#F5EFEB] text-base font-semibold text-[#78716C] hover:bg-[#eae1da]"
            >
              再試行
            </Button>
          </div>
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
                year={data.calendarYear}
                month={data.calendarMonth}
                dailyAmounts={data.dailyAmounts}
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
