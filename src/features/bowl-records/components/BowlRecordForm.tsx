import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Clock3, CupSoda, RefreshCw } from 'lucide-react'
import {
  calcWaterAmount,
  checkRecordedAtConsistency,
  isAbnormal,
  recordedAtIssueMessage,
} from '@/features/bowl-records/domain/bowlRecord'
import { AbnormalValueWarning } from '@/features/bowl-records/components/AbnormalValueWarning'
import {
  createActiveCycleFormSchema,
  createNoActiveCycleFormSchema,
  setAmountValueAs,
  type ActiveCycleFormValues,
  type NoActiveCycleFormValues,
} from '@/features/bowl-records/lib/bowlRecordFormSchema'
import {
  formatClockTime,
  formatElapsedLabel,
  toDateTimeLocalValue,
} from '@/features/bowl-records/lib/dateTime'
import type { BowlFormState, BowlRecord } from '@/features/bowl-records/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const END_PRESETS = [
  { label: '50ml', value: 50 },
  { label: '100ml', value: 100 },
  { label: '150ml', value: 150 },
  { label: '200ml', value: 200 },
] as const

const START_PRESETS = [
  { label: '150ml', value: 150 },
  { label: '200ml', value: 200 },
  { label: '250ml', value: 250 },
  { label: '300ml', value: 300 },
] as const

type BowlRecordFormProps = {
  formState: BowlFormState
  bowlKey: string
  /** 待機中の場合の前回記録時刻（直近完了サイクルの end_time） */
  previousRecordedAt: string | null
  isSubmitting: boolean
  errorMessage: string | null
  onSubmitNoActiveCycle: (values: NoActiveCycleFormValues) => Promise<void>
  onSubmitActiveCycle: (values: ActiveCycleFormValues) => Promise<void>
}

export function BowlRecordForm({
  formState,
  bowlKey,
  previousRecordedAt,
  isSubmitting,
  errorMessage,
  onSubmitNoActiveCycle,
  onSubmitActiveCycle,
}: BowlRecordFormProps) {
  if (formState.mode === 'no-active-cycle') {
    return (
      <NoActiveCycleForm
        key={bowlKey}
        previousRecordedAt={previousRecordedAt}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={onSubmitNoActiveCycle}
      />
    )
  }

  return (
    <ActiveCycleForm
      key={bowlKey}
      current={formState.current}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onSubmit={onSubmitActiveCycle}
    />
  )
}

type NoActiveCycleFormProps = {
  previousRecordedAt: string | null
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (values: NoActiveCycleFormValues) => Promise<void>
}

function NoActiveCycleForm({
  previousRecordedAt,
  isSubmitting,
  errorMessage,
  onSubmit,
}: NoActiveCycleFormProps) {
  const schema = useMemo(
    () =>
      createNoActiveCycleFormSchema({
        previousAt: previousRecordedAt,
      }),
    [previousRecordedAt],
  )

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NoActiveCycleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      recordedAt: toDateTimeLocalValue(),
    },
    mode: 'onChange',
  })

  const recordedAt = useWatch({ control, name: 'recordedAt' })
  const timeConsistency = checkRecordedAtConsistency(recordedAt ?? '', {
    previousAt: previousRecordedAt,
  })
  const canSubmit = timeConsistency.ok

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]"
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(values)
        })(event)
      }}
    >
      <StatusBanner mode="waiting" />

      <DateTimeField
        id="bowl-record-start-time"
        error={
          errors.recordedAt?.message ??
          (!timeConsistency.ok
            ? recordedAtIssueMessage(timeConsistency.reason)
            : undefined)
        }
        onSetNow={() =>
          setValue('recordedAt', toDateTimeLocalValue(), {
            shouldValidate: true,
          })
        }
        {...register('recordedAt')}
      />

      <AmountField
        id="bowl-record-start-amount"
        label="新しい容量"
        required
        unitAccent="water"
        error={errors.startAmountMl?.message}
        presets={START_PRESETS}
        onPreset={(value) =>
          setValue('startAmountMl', value, { shouldValidate: true })
        }
        {...register('startAmountMl', { setValueAs: setAmountValueAs })}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <SubmitButton isSubmitting={isSubmitting} disabled={!canSubmit} />
    </form>
  )
}

type ActiveCycleFormProps = {
  current: BowlRecord
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (values: ActiveCycleFormValues) => Promise<void>
}

function ActiveCycleForm({
  current,
  isSubmitting,
  errorMessage,
  onSubmit,
}: ActiveCycleFormProps) {
  const schema = useMemo(
    () =>
      createActiveCycleFormSchema({
        previousAt: current.start_time,
        startAmountMl: current.start_amount_ml,
      }),
    [current.start_amount_ml, current.start_time],
  )

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActiveCycleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      recordedAt: toDateTimeLocalValue(),
    },
    mode: 'onChange',
  })

  const endAmountMl = useWatch({ control, name: 'endAmountMl' })
  const startAmountMl = useWatch({ control, name: 'startAmountMl' })
  const recordedAt = useWatch({ control, name: 'recordedAt' })

  const endAmountNumber =
    typeof endAmountMl === 'number' && !Number.isNaN(endAmountMl)
      ? endAmountMl
      : null

  const abnormal =
    endAmountNumber !== null &&
    isAbnormal(current.start_amount_ml, endAmountNumber)

  const timeConsistency = checkRecordedAtConsistency(recordedAt ?? '', {
    previousAt: current.start_time,
  })

  const waterAmount =
    endAmountNumber !== null
      ? calcWaterAmount(current.start_amount_ml, endAmountNumber)
      : null

  const canSubmit = timeConsistency.ok && !abnormal

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]"
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(values)
        })(event)
      }}
    >
      <StatusBanner
        mode="active"
        startTime={current.start_time}
        startAmountMl={current.start_amount_ml}
      />

      <DateTimeField
        id="bowl-record-end-time"
        error={
          errors.recordedAt?.message ??
          (!timeConsistency.ok
            ? recordedAtIssueMessage(timeConsistency.reason)
            : undefined)
        }
        helperText="水皿の交換日時として記録されます。"
        onSetNow={() =>
          setValue('recordedAt', toDateTimeLocalValue(), {
            shouldValidate: true,
          })
        }
        {...register('recordedAt')}
      />

      <div className="flex flex-col gap-4 border-t border-[#F5EFEB] pt-4">
        <AmountField
          id="bowl-record-end-amount"
          label="残った容量"
          required
          unitAccent="terracotta"
          error={errors.endAmountMl?.message}
          presets={END_PRESETS}
          onPreset={(value) =>
            setValue('endAmountMl', value, { shouldValidate: true })
          }
          {...register('endAmountMl', { setValueAs: setAmountValueAs })}
        />

        {endAmountNumber !== null ? (
          <div
            className={cn(
              'rounded-xl px-4 py-3',
              abnormal ? 'bg-[#FEF3C7]' : 'bg-[#E0F2FE]',
            )}
          >
            <p className="text-xs text-[#78716C]">
              {current.start_amount_ml}ml − {endAmountNumber}ml
            </p>
            <p
              className={cn(
                'font-heading text-2xl font-bold tabular-nums',
                abnormal ? 'text-[#F59E0B]' : 'text-[#0284C7]',
              )}
            >
              {abnormal ? 0 : (waterAmount ?? 0)}
              <span className="ml-1 text-sm font-semibold">ml</span>
              <span className="ml-2 text-xs font-medium text-[#78716C]">
                飲水量（見込み）
              </span>
            </p>
          </div>
        ) : null}

        {abnormal && endAmountNumber !== null ? (
          <AbnormalValueWarning
            startAmountMl={current.start_amount_ml}
            endAmountMl={endAmountNumber}
          />
        ) : null}

        <AmountField
          id="bowl-record-next-start-amount"
          label="新しい容量"
          required={false}
          unitAccent="water"
          error={errors.startAmountMl?.message}
          helperText="空欄のまま保存すると、サイクル終了のみ記録します（片付け）。"
          presets={START_PRESETS}
          onPreset={(value) =>
            setValue('startAmountMl', value, { shouldValidate: true })
          }
          {...register('startAmountMl', { setValueAs: setAmountValueAs })}
        />

        {typeof startAmountMl === 'number' && !Number.isNaN(startAmountMl) ? (
          <p className="text-xs text-[#78716C]">
            終了記録と同時に、{startAmountMl}ml で新しいサイクルを開始します。
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <SubmitButton isSubmitting={isSubmitting} disabled={!canSubmit} />
    </form>
  )
}

type StatusBannerProps =
  | { mode: 'waiting' }
  | { mode: 'active'; startTime: string; startAmountMl: number }

function StatusBanner(props: StatusBannerProps) {
  if (props.mode === 'waiting') {
    return (
      <div className="flex items-center justify-between rounded-xl bg-[#F5EFEB] p-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#78716C] ring-1 ring-[#E7DFD8]">
            <CupSoda className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#78716C]">前回の給水記録</span>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#78716C]">
                待機中
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[#78716C]">
              新しい給水サイクルを開始します
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-[#F5EFEB] p-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0284C7]">
          <CupSoda className="size-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#78716C]">前回の給水記録</span>
            <span className="rounded-full bg-[#E0F2FE] px-1.5 py-0.5 text-[11px] font-medium text-[#0284C7]">
              設置中
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[#292524]">
            <span>{formatClockTime(props.startTime)}</span>
            <span className="font-normal text-[#A8A29E]">に</span>
            <span className="text-[#0284C7]">
              {props.startAmountMl}
              <span className="ml-0.5 text-xs">ml</span>
            </span>
            <span className="text-xs font-normal text-[#78716C]">給水</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-l border-[#E7DFD8] pl-3 text-right">
        <span className="block text-xs text-[#78716C]">経過</span>
        <p className="text-xs font-semibold text-[#292524]">
          {formatElapsedLabel(props.startTime)}
        </p>
      </div>
    </div>
  )
}

type DateTimeFieldProps = {
  id: string
  error?: string
  helperText?: string
  onSetNow: () => void
} & ComponentProps<'input'>

function DateTimeField({
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

function AmountField({
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

function SubmitButton({
  isSubmitting,
  disabled = false,
}: {
  isSubmitting: boolean
  disabled?: boolean
}) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      className="h-12 w-full gap-2 rounded-full bg-[#0EA5E9] text-base font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)] hover:bg-[#0284C7] disabled:opacity-50"
    >
      <CheckCircle2 className="size-5" strokeWidth={2} />
      {isSubmitting ? '保存中…' : '記録を保存する'}
    </Button>
  )
}
