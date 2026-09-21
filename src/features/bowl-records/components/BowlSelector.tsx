import { cn } from '@/lib/utils'
import type { Bowl } from '@/features/bowls/types'
import type { BowlRecord } from '@/features/bowl-records/types'
import { formatClockTime } from '@/features/bowl-records/lib/dateTime'
import { Droplets, GlassWater } from 'lucide-react'

type BowlSelectorProps = {
  bowls: Bowl[]
  activeCyclesByBowlId: Map<string, BowlRecord>
  selectedBowlId: string | null
  onSelect: (bowlId: string) => void
}

export function BowlSelector({
  bowls,
  activeCyclesByBowlId,
  selectedBowlId,
  onSelect,
}: BowlSelectorProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
      <p className="text-sm font-semibold text-[#292524]">水皿を選択</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {bowls.map((bowl) => {
          const active = activeCyclesByBowlId.get(bowl.id)
          const selected = bowl.id === selectedBowlId

          return (
            <button
              key={bowl.id}
              type="button"
              onClick={() => onSelect(bowl.id)}
              className={cn(
                'relative w-[140px] shrink-0 overflow-hidden rounded-xl bg-white p-3 text-left transition-all active:scale-[0.98]',
                selected
                  ? 'border border-[#0EA5E9]/20 shadow-md'
                  : 'opacity-60 shadow-sm',
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full',
                    active
                      ? 'bg-[#E0F2FE] text-[#0284C7]'
                      : 'bg-[#F5EFEB] text-[#78716C]',
                  )}
                >
                  {active ? (
                    <Droplets className="size-4" strokeWidth={2} />
                  ) : (
                    <GlassWater className="size-4" strokeWidth={2} />
                  )}
                </div>
                {active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-1.5 py-0.5 text-[11px] text-[#0284C7]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#0284C7]" />
                    設置中
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#F5EFEB] px-1.5 py-0.5 text-[11px] text-[#78716C]">
                    待機中
                  </span>
                )}
              </div>
              <div className="mt-2 min-w-0">
                <h3 className="truncate text-sm font-semibold text-[#292524]">
                  {bowl.name}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-[#78716C]">
                  {active
                    ? `開始: ${formatClockTime(active.start_time)} (${active.start_amount_ml}ml)`
                    : '待機中'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
