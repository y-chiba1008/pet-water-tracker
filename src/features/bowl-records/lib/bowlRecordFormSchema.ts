import { z } from 'zod'

const amountField = z
  .number({ error: '容量を入力してください' })
  .int('整数で入力してください')
  .min(0, '0ml以上で入力してください')
  .max(5000, '5000ml以下で入力してください')

const recordedAtField = z
  .string()
  .min(1, '日時を入力してください')
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: '正しい日時を入力してください',
  })

export const noActiveCycleFormSchema = z.object({
  recordedAt: recordedAtField,
  startAmountMl: amountField,
})

export const activeCycleFormSchema = z.object({
  recordedAt: recordedAtField,
  endAmountMl: amountField,
  startAmountMl: amountField.optional(),
})

export type NoActiveCycleFormValues = z.infer<typeof noActiveCycleFormSchema>
export type ActiveCycleFormValues = z.infer<typeof activeCycleFormSchema>

/** number input の空欄 / NaN を undefined に揃える */
export function setAmountValueAs(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return undefined
    }
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}
