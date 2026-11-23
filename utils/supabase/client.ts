import { createBrowserClient } from "@supabase/ssr"

// Browser Supabase client (TypeScript form of utils/supabase/client.js).

import { getSupabaseEnv } from "@/utils/supabase/env"

export function createClient() {
  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return null
  return createBrowserClient(url, key)
}
