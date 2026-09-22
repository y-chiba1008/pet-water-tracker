import { z } from 'zod'
import {
  checkRecordedAtConsistency,
  isAbnormal,
  recordedAtIssueMessage,
} from '@/features/bowl-records/domain/bowlRecord'

const startAmountField = z
  .number({ error: '新しい容量を入力してください。' })
  .int('整数で入力してください。')
  .min(0, '0ml以上で入力してください。')
  .max(5000, '5000ml以下で入力してください。')

const endAmountField = z
  .number({ error: '残った容量を入力してください。' })
  .int('整数で入力してください。')
  .min(0, '0ml以上で入力してください。')
  .max(5000, '5000ml以下で入力してください。')

const recordedAtField = z
  .string()
  .min(1, '日時を入力してください。')
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: '正しい日時を入力してください。',
  })

const noActiveCycleBaseSchema = z.object({
  recordedAt: recordedAtField,
  startAmountMl: startAmountField,
})

const activeCycleBaseSchema = z.object({
  recordedAt: recordedAtField,
  endAmountMl: endAmountField,
  startAmountMl: startAmountField.optional(),
})

export type NoActiveCycleFormValues = z.infer<typeof noActiveCycleBaseSchema>
export type ActiveCycleFormValues = z.infer<typeof activeCycleBaseSchema>

type RecordedAtSchemaOptions = {
  previousAt?: string | null
  now?: Date
}

export function createNoActiveCycleFormSchema(
  options: RecordedAtSchemaOptions = {},
) {
  return noActiveCycleBaseSchema.superRefine((values, ctx) => {
    const consistency = checkRecordedAtConsistency(values.recordedAt, {
      previousAt: options.previousAt,
      now: options.now,
    })
    if (!consistency.ok) {
      ctx.addIssue({
        code: 'custom',
        path: ['recordedAt'],
        message: recordedAtIssueMessage(consistency.reason),
      })
    }
  })
}

export function createActiveCycleFormSchema(
  options: RecordedAtSchemaOptions & { startAmountMl: number },
) {
  return activeCycleBaseSchema.superRefine((values, ctx) => {
    const consistency = checkRecordedAtConsistency(values.recordedAt, {
      previousAt: options.previousAt,
      now: options.now,
    })
    if (!consistency.ok) {
      ctx.addIssue({
        code: 'custom',
        path: ['recordedAt'],
        message: recordedAtIssueMessage(consistency.reason),
      })
    }

    if (isAbnormal(options.startAmountMl, values.endAmountMl)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endAmountMl'],
        message: '終了容量は開始容量以下にしてください。',
      })
    }
  })
}
