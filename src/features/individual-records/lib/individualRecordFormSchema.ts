import { z } from 'zod'
import { truncateToMinute } from '@/shared/lib/dateTime'

const amountField = z
  .number({ error: '飲水量を入力してください。' })
  .int('整数で入力してください。')
  .min(1, '1ml以上で入力してください。')
  .max(500, '500ml以下で入力してください。')

const recordedAtField = z
  .string()
  .min(1, '日時を入力してください。')
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: '正しい日時を入力してください。',
  })

const baseSchema = z.object({
  recordedAt: recordedAtField,
  amountMl: amountField,
})

export type IndividualRecordFormValues = z.infer<typeof baseSchema>

type SchemaOptions = {
  now?: Date
}

export function createIndividualRecordFormSchema(
  options: SchemaOptions = {},
) {
  return baseSchema.superRefine((values, ctx) => {
    // recordedAtField で Date.parse 可能な値のみ通る
    const recorded = truncateToMinute(new Date(values.recordedAt))
    const now = truncateToMinute(options.now ?? new Date())
    if (recorded.getTime() > now.getTime()) {
      ctx.addIssue({
        code: 'custom',
        path: ['recordedAt'],
        message: '現在時刻以前の日時を入力してください。',
      })
    }
  })
}
