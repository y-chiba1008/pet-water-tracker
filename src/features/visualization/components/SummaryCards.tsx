import { CalendarDays, Droplet } from 'lucide-react'

type SummaryCardsProps = {
  todayAmountMl: number
  latestRecordedAtLabel: string | null
  monthAverageMl: number | null
  monthRecordedDays: number
}

export function SummaryCards({
  todayAmountMl,
  latestRecordedAtLabel,
  monthAverageMl,
  monthRecordedDays,
}: SummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-2 pt-4">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <div className="pointer-events-none absolute -top-3 -right-3 size-16 rounded-full bg-[#E0F2FE]/60" />
        <div className="relative z-10 flex items-center gap-1 text-[#78716C]">
          <Droplet
            className="size-[18px] text-[#0EA5E9]"
            strokeWidth={1.75}
            fill="currentColor"
          />
          <span className="text-[11px] leading-[14px] font-medium tracking-wide">
            今日の合計
          </span>
        </div>
        <div className="relative z-10 mt-2 flex items-baseline gap-1">
          <span className="font-heading text-[28px] leading-9 font-bold tracking-tight text-[#292524] tabular-nums">
            {todayAmountMl}
          </span>
          <span className="text-xs font-semibold text-[#78716C]">ml</span>
        </div>
        <div className="relative z-10 mt-1 text-[11px] leading-[14px] font-medium text-[#0EA5E9]">
          {latestRecordedAtLabel
            ? `前回の記録 ${latestRecordedAtLabel}`
            : '前回の記録 —'}
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
        <div className="pointer-events-none absolute -top-3 -right-3 size-16 rounded-full bg-[#F5EFEB]" />
        <div className="relative z-10 flex items-center gap-1 text-[#78716C]">
          <CalendarDays
            className="size-[18px] text-[#EA580C]"
            strokeWidth={1.75}
          />
          <span className="text-[11px] leading-[14px] font-medium tracking-wide">
            今月の1日平均
          </span>
        </div>
        <div className="relative z-10 mt-2 flex items-baseline gap-1">
          <span className="font-heading text-[28px] leading-9 font-bold tracking-tight text-[#292524] tabular-nums">
            {monthAverageMl ?? '—'}
          </span>
          {monthAverageMl != null ? (
            <span className="text-xs font-semibold text-[#78716C]">ml</span>
          ) : null}
        </div>
        <div className="relative z-10 mt-1 text-[11px] leading-[14px] font-medium text-[#78716C]">
          計 {monthRecordedDays}日間 記録済み
        </div>
      </div>
    </section>
  )
}
