import { CalendarDays, ChartLine } from 'lucide-react'
import type { HomeViewMode } from '@/features/visualization/types'
import { cn } from '@/lib/utils'

type ViewSwitcherProps = {
  mode: HomeViewMode
  onChange: (mode: HomeViewMode) => void
}

const tabs = [
  { mode: 'calendar' as const, label: 'カレンダー', icon: CalendarDays },
  { mode: 'chart' as const, label: '折れ線グラフ', icon: ChartLine },
]

export function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-full bg-[#F5EFEB] p-1 shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = mode === tab.mode
        return (
          <button
            key={tab.mode}
            type="button"
            onClick={() => onChange(tab.mode)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-white text-[#292524] shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
                : 'text-[#78716C] hover:text-[#292524]',
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
