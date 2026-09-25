import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in the environment',
  )
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      // implicit フローだとトークンが URL のハッシュに載るため、PKCE を使う
      flowType: 'pkce',
    },
  },
)
