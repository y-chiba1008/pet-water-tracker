import type { ComponentProps } from 'react'
import { CupSoda } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type AmountFieldProps = {
  id: string
  label: string
  required: boolean
  unitAccent: 'water' | 'terracotta'
  error?: string
  helperText?: string
  presets: readonly { label: string; value: number }[]
  onPreset: (value: number) => void
} & ComponentProps<'input'>

export function AmountField({
  id,
  label,
  required,
  unitAccent,
  error,
  helperText,
  presets,
  onPreset,
  ...inputProps
}: AmountFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#292524]"
      >
        <CupSoda
          className={cn(
            'size-[18px]',
            unitAccent === 'water' ? 'text-[#0284C7]' : 'text-[#EA580C]',
          )}
          strokeWidth={2}
        />
        {label}
        {required ? <span className="font-bold text-[#ba1a1a]">*</span> : null}
      </Label>
      <div className="relative flex items-center rounded-xl bg-[#F5EFEB] px-4 py-2 transition-all focus-within:bg-white focus-within:shadow-md">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          className="h-12 border-0 bg-transparent p-0 pr-12 text-center font-heading text-[32px] leading-[38px] font-bold tracking-tight text-[#292524] shadow-none focus-visible:ring-0 md:text-[32px]"
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        <span className="pointer-events-none absolute right-4 font-heading text-xl font-semibold text-[#78716C]">
          ml
        </span>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#78716C]">{helperText}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className="rounded-full border border-transparent bg-[#eaeef4] px-3.5 py-1.5 text-xs font-semibold text-[#292524] transition-all hover:bg-[#e4e8ee] active:scale-95"
            onClick={() => onPreset(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
