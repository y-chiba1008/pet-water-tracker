import { AlertTriangle } from 'lucide-react'

type AbnormalValueWarningProps = {
  startAmountMl: number
  endAmountMl: number
}

export function AbnormalValueWarning({
  startAmountMl,
  endAmountMl,
}: AbnormalValueWarningProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] px-3 py-2.5 text-sm text-[#92400E]"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div className="min-w-0">
        <p className="font-heading font-semibold">容量の値が異常です</p>
        <p className="mt-0.5 text-xs leading-relaxed">
          終了容量（{endAmountMl}ml）が開始容量（{startAmountMl}
          ml）より大きくなっています。入力ミスや途中の継ぎ足しがないか確認してください。
        </p>
      </div>
    </div>
  )
}
