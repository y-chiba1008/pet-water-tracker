import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { toLocalDateKey } from '@/features/visualization/domain/dailySummary'
import { cn } from '@/lib/utils'

type CalendarViewProps = {
  year: number
  month: number
  dailyAmounts: Map<string, number>
  today?: Date
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

function formatCellAmount(amount: number | undefined): string {
  if (amount === undefined) return '—'
  return `${amount}ml`
}

export function CalendarView({
  year,
  month,
  dailyAmounts,
  today = new Date(),
}: CalendarViewProps) {
  const monthStart = startOfMonth(new Date(year, month - 1, 1))
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <span className="font-heading text-xl leading-7 font-semibold text-[#292524]">
          {format(monthStart, 'yyyy年 M月', { locale: ja })}
        </span>
        <span className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] leading-[14px] font-medium text-[#0284C7]">
          当月
        </span>
      </div>

      <div className="flex flex-col rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <div className="grid grid-cols-7 pb-1 text-center">
          {WEEKDAY_LABELS.map((label, index) => (
            <span
              key={label}
              className={cn(
                'py-1 text-[11px] leading-[14px] font-medium',
                index === 0 && 'text-[#EA580C]/80',
                index === 6 && 'text-[#0284C7]/80',
                index !== 0 && index !== 6 && 'text-[#78716C]',
              )}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, today)
            const key = toLocalDateKey(day)
            const amount = dailyAmounts.get(key)
            const weekday = day.getDay()

            return (
              <div
                key={key}
                className={cn(
                  'flex h-14 flex-col justify-between rounded-lg p-1',
                  !inMonth && 'bg-[#fcf2eb]/40 opacity-35',
                  inMonth && !isToday && 'bg-[#fcf2eb]',
                  isToday && 'bg-[#E0F2FE]/70 shadow-xs',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs leading-[18px]',
                      !inMonth && 'text-[#A8A29E]',
                      inMonth && isToday && 'font-bold text-[#0EA5E9]',
                      inMonth &&
                        !isToday &&
                        weekday === 0 &&
                        'text-[#EA580C]',
                      inMonth &&
                        !isToday &&
                        weekday === 6 &&
                        'text-[#0284C7]',
                      inMonth &&
                        !isToday &&
                        weekday !== 0 &&
                        weekday !== 6 &&
                        'text-[#78716C]',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {isToday ? (
                    <span className="size-1.5 rounded-full bg-[#0EA5E9]" />
                  ) : null}
                </div>
                <span
                  className={cn(
                    'self-center text-[11px] leading-[14px] font-semibold tabular-nums',
                    amount === undefined
                      ? 'text-[#A8A29E]'
                      : isToday
                        ? 'font-bold text-[#0EA5E9]'
                        : 'text-[#292524]',
                  )}
                >
                  {formatCellAmount(amount)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
