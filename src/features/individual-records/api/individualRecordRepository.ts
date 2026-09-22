import { supabase } from '@/shared/lib/supabaseClient'
import type {
  IndividualRecord,
  InsertIndividualRecordInput,
} from '@/features/individual-records/types'

export async function insertIndividualRecord(
  input: InsertIndividualRecordInput,
): Promise<IndividualRecord> {
  const { data, error } = await supabase
    .from('individual_records')
    .insert({
      recorded_at: input.recordedAt,
      amount_ml: input.amountMl,
      recorded_by: input.recordedBy,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}
