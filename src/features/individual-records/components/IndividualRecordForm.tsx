import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createIndividualRecordFormSchema,
  type IndividualRecordFormValues,
} from '@/features/individual-records/lib/individualRecordFormSchema'
import { AmountField } from '@/shared/components/AmountField'
import { DateTimeField } from '@/shared/components/DateTimeField'
import { RecordSubmitButton } from '@/shared/components/RecordSubmitButton'
import { toDateTimeLocalValue } from '@/shared/lib/dateTime'
import { setAmountValueAs } from '@/shared/lib/setAmountValueAs'

const AMOUNT_PRESETS = [
  { label: '+10ml', value: 10 },
  { label: '+20ml', value: 20 },
  { label: '+50ml', value: 50 },
] as const

type IndividualRecordFormProps = {
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (values: IndividualRecordFormValues) => Promise<void>
}

export function IndividualRecordForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: IndividualRecordFormProps) {
  const schema = useMemo(() => createIndividualRecordFormSchema(), [])

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<IndividualRecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      recordedAt: toDateTimeLocalValue(),
    },
    mode: 'onChange',
  })

  const amountMl = useWatch({ control, name: 'amountMl' })

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-[0_2px_8px_-2px_rgba(120,113,108,0.06)]"
      onSubmit={(event) => {
        void handleSubmit(async (values) => {
          await onSubmit(values)
        })(event)
      }}
    >
      <DateTimeField
        id="individual-record-time"
        error={errors.recordedAt?.message}
        onSetNow={() =>
          setValue('recordedAt', toDateTimeLocalValue(), {
            shouldValidate: true,
          })
        }
        {...register('recordedAt')}
      />

      <AmountField
        id="individual-record-amount"
        label="飲水量"
        required
        unitAccent="water"
        min={1}
        max={500}
        error={errors.amountMl?.message}
        presets={AMOUNT_PRESETS}
        onPreset={(value) => {
          const current =
            typeof amountMl === 'number' && !Number.isNaN(amountMl)
              ? amountMl
              : 0
          setValue('amountMl', current + value, { shouldValidate: true })
        }}
        {...register('amountMl', { setValueAs: setAmountValueAs })}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <RecordSubmitButton isSubmitting={isSubmitting} disabled={!isValid} />
    </form>
  )
}
