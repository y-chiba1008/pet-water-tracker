import type { Tables } from '@/shared/types/database'

export type BowlRecordRow = Tables<'bowl_records'>
export type IndividualRecordRow = Tables<'individual_records'>

export type HomeViewMode = 'calendar' | 'chart'
