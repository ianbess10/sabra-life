import type { User } from "@supabase/supabase-js"

import type { CitySlug, Inventory } from "@/lib/types"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/utils/supabase/env"

export function usernameFromUser(user: User) {
  const meta = user.user_metadata?.username
  if (typeof meta === "string" && meta.trim()) return meta.trim().slice(0, 32)
  const fromEmail = user.email?.split("@")[0]
  if (fromEmail) return fromEmail.slice(0, 32)
  return `oleh-${user.id.slice(0, 8)}`
}

export type CloudProgress = {
  shekels: number
  xp: number
  location: CitySlug
  inventory: Inventory
  completedMissions: string[]
  currentStreak: number
  longestStreak: number
  lastMissionDate: string | null
}

export type CloudProfileRow = {
  id: string
  shekels: number
  xp: number
  location: string
  completed_missions: string[] | null
  current_streak?: number | null
  longest_streak?: number | null
  last_mission_date?: string | null
  updated_at: string
}

export type CloudInventoryRow = {
  user_id: string
  vehicle: string | null
  property: string | null
  phone: string
  dining: string
}

const CITIES = new Set(["tel-aviv", "jerusalem", "raanana"])

function asCity(value: string): CitySlug {
  return CITIES.has(value) ? (value as CitySlug) : "tel-aviv"
}

export function progressScore(progress: CloudProgress) {
  return progress.xp * 1000 + progress.shekels + progress.completedMissions.length * 50
}

export async function getAuthUser() {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export type FetchCloudResult =
  | { ok: true; progress: CloudProgress }
  | { ok: false; reason: "offline" | "signed-out" | "missing" | "error" }

function asVehicle(value: string | null | undefined): Inventory["vehicle"] {
  if (value === "rav-kav" || value === "korkinet" || value === "mazda" || value === "tesla") {
    return value
  }
  return null
}

function asProperty(value: string | null | undefined): Inventory["property"] {
  if (
    value === "hostel" ||
    value === "ta-share" ||
    value === "jer-stone" ||
    value === "raanana-villa"
  ) {
    return value
  }
  return null
}

function asPhone(value: string | null | undefined): Inventory["phone"] {
  return value === "smartphone" ? "smartphone" : "basic"
}

function asDining(value: string | null | undefined): Inventory["dining"] {
  return value === "fine" ? "fine" : "street"
}

export async function fetchCloudProgress(): Promise<FetchCloudResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "offline" }
  const supabase = createClient()
  if (!supabase) return { ok: false, reason: "offline" }

  const user = await getAuthUser()
  if (!user) return { ok: false, reason: "signed-out" }

  const [{ data: profile, error: profileError }, { data: inventory, error: inventoryError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("inventory").select("*").eq("user_id", user.id).maybeSingle(),
    ])

  if (profileError || inventoryError) {
    console.error(profileError ?? inventoryError)
    return { ok: false, reason: "error" }
  }

  if (!profile) return { ok: false, reason: "missing" }

  const row = profile as CloudProfileRow
  const bag = (inventory ?? null) as CloudInventoryRow | null

  return {
    ok: true,
    progress: {
      shekels: row.shekels,
      xp: row.xp,
      location: asCity(row.location),
      completedMissions: row.completed_missions ?? [],
      currentStreak: Number(row.current_streak) || 0,
      longestStreak: Number(row.longest_streak) || 0,
      lastMissionDate: row.last_mission_date ?? null,
      inventory: {
        vehicle: asVehicle(bag?.vehicle),
        property: asProperty(bag?.property),
        phone: asPhone(bag?.phone),
        dining: asDining(bag?.dining),
      },
    },
  }
}

export async function saveCloudProgress(progress: CloudProgress) {
  if (!isSupabaseConfigured()) return { ok: false as const, reason: "offline" }
  const supabase = createClient()
  if (!supabase) return { ok: false as const, reason: "offline" }

  const user = await getAuthUser()
  if (!user) return { ok: false as const, reason: "signed-out" }

  const now = new Date().toISOString()
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    username: usernameFromUser(user),
    shekels: progress.shekels,
    xp: progress.xp,
    location: progress.location,
    completed_missions: progress.completedMissions,
    current_streak: progress.currentStreak,
    longest_streak: progress.longestStreak,
    last_mission_date: progress.lastMissionDate,
    updated_at: now,
  })

  if (profileError) {
    console.error(profileError)
    return { ok: false as const, reason: "error" }
  }

  const { error: inventoryError } = await supabase.from("inventory").upsert(
    {
      user_id: user.id,
      vehicle: progress.inventory.vehicle,
      property: progress.inventory.property,
      phone: progress.inventory.phone,
      dining: progress.inventory.dining,
      updated_at: now,
    },
    { onConflict: "user_id" }
  )

  if (inventoryError) {
    console.error(inventoryError)
    return { ok: false as const, reason: "error" }
  }

  return { ok: true as const }
}
