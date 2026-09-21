import { Droplet, Pencil, Trash2 } from 'lucide-react'
import type { Bowl } from '@/features/bowls/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type BowlCycleDisplay =
  | { status: 'active'; detailLabel: string }
  | { status: 'standby'; detailLabel: string }

type BowlListItemProps = {
  bowl: Bowl
  cycle: BowlCycleDisplay
  onEdit: (bowl: Bowl) => void
  onDeactivate: (bowl: Bowl) => void
}

export function BowlListItem({
  bowl,
  cycle,
  onEdit,
  onDeactivate,
}: BowlListItemProps) {
  const isActive = cycle.status === 'active'

  return (
    <article className="relative flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#006591]">
            <Droplet className="size-5" strokeWidth={2} />
          </div>
          <div className="flex min-w-0 flex-col">
            <h2 className="font-heading truncate text-base font-semibold text-[#292524]">
              {bowl.name}
            </h2>
            <span className="truncate text-xs text-[#78716C]">
              {cycle.detailLabel}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[#78716C] hover:bg-[#F5EFEB]"
            aria-label={`${bowl.name}を編集`}
            onClick={() => onEdit(bowl)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-[#78716C] hover:bg-[#ffdad6]/30 hover:text-[#ba1a1a]"
            aria-label={`${bowl.name}を削除`}
            onClick={() => onDeactivate(bowl)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex items-center justify-between rounded-lg px-4 py-2.5',
          isActive ? 'bg-[#E0F2FE]/70' : 'bg-[#F5EFEB]',
        )}
      >
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#38BDF8] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#0284C7]" />
            </span>
          ) : (
            <span className="inline-flex size-2.5 rounded-full bg-[#A8A29E]" />
          )}
          <span
            className={cn(
              'text-xs font-semibold',
              isActive ? 'text-[#0284C7]' : 'text-[#78716C]',
            )}
          >
            {isActive ? '設置中' : '待機中'}
          </span>
        </div>
      </div>
    </article>
  )
}
