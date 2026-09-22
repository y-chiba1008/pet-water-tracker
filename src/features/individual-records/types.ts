import type { Tables } from '@/shared/types/database'

export type IndividualRecord = Tables<'individual_records'>

export type InsertIndividualRecordInput = {
  recordedAt: string
  amountMl: number
  recordedBy: string
}
