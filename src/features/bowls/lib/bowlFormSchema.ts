import { z } from 'zod'

export const bowlFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '水皿の名前を入力してください')
    .max(40, '40文字以内で入力してください'),
})

export type BowlFormValues = z.infer<typeof bowlFormSchema>
