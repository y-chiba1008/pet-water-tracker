import { supabase } from '@/shared/lib/supabaseClient'
import type {
  BowlRecord,
  CompleteCycleAndStartNextInput,
  InsertStartRecordInput,
  UpdateEndRecordInput,
} from '@/features/bowl-records/types'

export async function fetchActiveCycle(
  bowlId: string,
): Promise<BowlRecord | null> {
  const { data, error } = await supabase
    .from('bowl_records')
    .select('*')
    .eq('bowl_id', bowlId)
    .is('end_time', null)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function fetchAllActiveCycles(): Promise<BowlRecord[]> {
  const { data, error } = await supabase
    .from('bowl_records')
    .select('*')
    .is('end_time', null)

  if (error) {
    throw error
  }

  return data
}

/** 当該水皿の直近の完了サイクル（end_time が最も新しいもの） */
export async function fetchLatestCompletedCycle(
  bowlId: string,
): Promise<BowlRecord | null> {
  const { data, error } = await supabase
    .from('bowl_records')
    .select('*')
    .eq('bowl_id', bowlId)
    .not('end_time', 'is', null)
    .order('end_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function insertStartRecord(
  input: InsertStartRecordInput,
): Promise<BowlRecord> {
  const { data, error } = await supabase
    .from('bowl_records')
    .insert({
      bowl_id: input.bowlId,
      start_time: input.startTime,
      start_amount_ml: input.startAmountMl,
      start_recorded_by: input.recordedBy,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateEndRecord(
  input: UpdateEndRecordInput,
): Promise<BowlRecord> {
  const { data, error } = await supabase
    .from('bowl_records')
    .update({
      end_time: input.endTime,
      end_amount_ml: input.endAmountMl,
      end_recorded_by: input.recordedBy,
    })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

/** 進行中サイクルを終了し、続けて新しいサイクルを開始する */
export async function completeCycleAndStartNext(
  input: CompleteCycleAndStartNextInput,
): Promise<{ ended: BowlRecord; started: BowlRecord }> {
  const ended = await updateEndRecord({
    id: input.activeRecordId,
    endTime: input.endTime,
    endAmountMl: input.endAmountMl,
    recordedBy: input.recordedBy,
  })

  const started = await insertStartRecord({
    bowlId: input.bowlId,
    startTime: input.startTime,
    startAmountMl: input.startAmountMl,
    recordedBy: input.recordedBy,
  })

  return { ended, started }
}
