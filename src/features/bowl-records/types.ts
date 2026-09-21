import type { Tables } from '@/shared/types/database'

export type BowlRecord = Tables<'bowl_records'>

export type BowlFormState =
  | { mode: 'no-active-cycle' }
  | { mode: 'active-cycle'; current: BowlRecord }

export type InsertStartRecordInput = {
  bowlId: string
  startTime: string
  startAmountMl: number
  recordedBy: string
}

export type UpdateEndRecordInput = {
  id: string
  endTime: string
  endAmountMl: number
  recordedBy: string
}

export type CompleteCycleAndStartNextInput = {
  activeRecordId: string
  bowlId: string
  endTime: string
  endAmountMl: number
  startTime: string
  startAmountMl: number
  recordedBy: string
}
