import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/utils/supabase/env"

export type LeaderboardSort = "xp" | "shekels"

export type LeaderboardEntry = {
  id: string
  username: string | null
  xp: number
  shekels: number
}

export type FetchLeaderboardResult =
  | { ok: true; rows: LeaderboardEntry[] }
  | { ok: false; reason: "offline" | "error" }

export async function fetchLeaderboard(
  sort: LeaderboardSort
): Promise<FetchLeaderboardResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "offline" }
  const supabase = createClient()
  if (!supabase) return { ok: false, reason: "offline" }

  let query = supabase.from("public_leaderboard").select("id, username, xp, shekels")
  if (sort === "xp") {
    query = query.order("xp", { ascending: false })
  } else {
    query = query.order("shekels", { ascending: false })
  }

  const { data, error } = await query.limit(50)

  if (error) {
    console.error(error)
    return { ok: false, reason: "error" }
  }

  const rows: LeaderboardEntry[] = (data ?? []).map((row) => ({
    id: String(row.id),
    username: typeof row.username === "string" ? row.username : null,
    xp: Number(row.xp) || 0,
    shekels: Number(row.shekels) || 0,
  }))

  return { ok: true, rows }
}
