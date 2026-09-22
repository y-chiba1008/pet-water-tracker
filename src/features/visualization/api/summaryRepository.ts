import { supabase } from '@/shared/lib/supabaseClient'
import type {
  BowlRecordRow,
  IndividualRecordRow,
} from '@/features/visualization/types'

export type SummaryRecords = {
  bowlRecords: BowlRecordRow[]
  individualRecords: IndividualRecordRow[]
}

/**
 * 指定期間の完了済み水皿記録と個別記録を取得する。
 * 水皿は end_time、個別は recorded_at で期間フィルタする。
 */
export async function fetchSummaryRecords(range: {
  fromIso: string
  toIso: string
}): Promise<SummaryRecords> {
  const [bowlResult, individualResult] = await Promise.all([
    supabase
      .from('bowl_records')
      .select('*')
      .not('end_time', 'is', null)
      .gte('end_time', range.fromIso)
      .lte('end_time', range.toIso),
    supabase
      .from('individual_records')
      .select('*')
      .gte('recorded_at', range.fromIso)
      .lte('recorded_at', range.toIso),
  ])

  if (bowlResult.error) {
    throw bowlResult.error
  }
  if (individualResult.error) {
    throw individualResult.error
  }

  return {
    bowlRecords: bowlResult.data,
    individualRecords: individualResult.data,
  }
}
