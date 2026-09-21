import { supabase } from '@/shared/lib/supabaseClient'
import type { Bowl } from '@/features/bowls/types'

export async function fetchActiveBowls(): Promise<Bowl[]> {
  const { data, error } = await supabase
    .from('bowls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function createBowl(name: string): Promise<Bowl> {
  const { data, error } = await supabase
    .from('bowls')
    .insert({ name })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateBowlName(
  id: string,
  name: string,
): Promise<Bowl> {
  const { data, error } = await supabase
    .from('bowls')
    .update({ name })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deactivateBowl(id: string): Promise<Bowl> {
  const { data, error } = await supabase
    .from('bowls')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}
