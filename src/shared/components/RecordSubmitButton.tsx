import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type RecordSubmitButtonProps = {
  isSubmitting: boolean
  disabled?: boolean
  /** 送信待機中のラベル（デフォルト: 記録を保存する） */
  label?: string
}

export function RecordSubmitButton({
  isSubmitting,
  disabled = false,
  label = '記録を保存する',
}: RecordSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      className="h-12 w-full gap-2 rounded-full bg-[#0EA5E9] text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7] disabled:opacity-50"
    >
      <CheckCircle2 className="size-5" strokeWidth={2} />
      {isSubmitting ? '保存中…' : label}
    </Button>
  )
}
