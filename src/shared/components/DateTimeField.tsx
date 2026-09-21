import type { ComponentProps } from 'react'
import { Clock3, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DateTimeFieldProps = {
  id: string
  error?: string
  helperText?: string
  onSetNow: () => void
} & ComponentProps<'input'>

export function DateTimeField({
  id,
  error,
  helperText,
  onSetNow,
  ...inputProps
}: DateTimeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={id}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#292524]"
        >
          <Clock3 className="size-[18px] text-[#0284C7]" strokeWidth={2} />
          日時 <span className="font-bold text-[#ba1a1a]">*</span>
        </Label>
        <button
          type="button"
          className="flex items-center gap-0.5 text-xs text-[#0284C7] hover:underline"
          onClick={onSetNow}
        >
          <RefreshCw className="size-3.5" strokeWidth={2} />
          現在時刻にする
        </button>
      </div>
      <div className="rounded-xl bg-[#F5EFEB] px-4 py-3">
        <Input
          id={id}
          type="datetime-local"
          className="h-auto border-0 bg-transparent p-0 text-base text-[#292524] shadow-none focus-visible:ring-0"
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs leading-tight text-[#A8A29E]">{helperText}</p>
      ) : null}
    </div>
  )
}
