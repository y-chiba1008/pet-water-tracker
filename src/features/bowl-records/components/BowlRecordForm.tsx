import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CupSoda } from 'lucide-react'
import {
  calcWaterAmount,
  checkRecordedAtConsistency,
  isAbnormal,
  recordedAtIssueMessage,
} from '@/features/bowl-records/domain/bowlRecord'
import {
  createActiveCycleFormSchema,
  createNoActiveCycleFormSchema,
  type ActiveCycleFormValues,
  type NoActiveCycleFormValues,
} from '@/features/bowl-records/lib/bowlRecordFormSchema'
import type { BowlFormState, BowlRecord } from '@/features/bowl-records/types'
import { AmountField } from '@/shared/components/AmountField'
import { DateTimeField } from '@/shared/components/DateTimeField'
import { RecordSubmitButton } from '@/shared/components/RecordSubmitButton'
import {
  formatClockTime,
  formatElapsedLabel,
  toDateTimeLocalValue,
} from '@/shared/lib/dateTime'
import { setAmountValueAs } from '@/shared/lib/setAmountValueAs'
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

      <RecordSubmitButton isSubmitting={isSubmitting} disabled={!canSubmit} />
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

      <RecordSubmitButton isSubmitting={isSubmitting} disabled={!canSubmit} />
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
