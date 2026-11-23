import { createServerClient } from "@supabase/ssr"

// Server Supabase client (TypeScript form of utils/supabase/server.js).
import { cookies } from "next/headers"

import { getSupabaseEnv } from "@/utils/supabase/env"

export async function createClient() {
  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return null

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component. The proxy/middleware refreshes the session.
        }
      },
    },
  })
}
