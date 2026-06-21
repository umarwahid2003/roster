import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Only import/use this inside route handlers that run on the server (like the cron job).
// Never expose the service role key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
