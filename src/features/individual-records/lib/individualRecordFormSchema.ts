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

/**
 * 未来日時チェックはフィールド単位で行う。
 * object 全体の superRefine だと、飲水量が未入力・不正な間は実行されずエラーが表示されない。
 */
export function createIndividualRecordFormSchema(
  options: SchemaOptions = {},
) {
  return baseSchema.extend({
    recordedAt: recordedAtField.refine(
      (value) => {
        const recorded = truncateToMinute(new Date(value))
        if (Number.isNaN(recorded.getTime())) return true
        const now = truncateToMinute(options.now ?? new Date())
        return recorded.getTime() <= now.getTime()
      },
      { message: '現在時刻以前の日時を入力してください。' },
    ),
  })
}
