export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  const configured = Boolean(url && key && url.startsWith("http"))
  return { url, key, configured }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured
}
