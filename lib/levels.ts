import type { CitySlug } from "@/lib/types"

export type UlpanLevel = {
  level: number
  minXp: number
  nameHe: string
  nameEn: string
  unlocks: CitySlug[]
}

export const LEVELS: UlpanLevel[] = [
  {
    level: 1,
    minXp: 0,
    nameHe: "אולפן א׳",
    nameEn: "Ulpan Aleph",
    unlocks: ["tel-aviv"],
  },
  {
    level: 2,
    minXp: 120,
    nameHe: "אולפן ב׳",
    nameEn: "Ulpan Bet",
    unlocks: ["jerusalem"],
  },
  {
    level: 3,
    minXp: 280,
    nameHe: "אולפן ג׳",
    nameEn: "Ulpan Gimel",
    unlocks: [],
  },
  {
    level: 4,
    minXp: 480,
    nameHe: "אולפן ד׳",
    nameEn: "Ulpan Dalet",
    unlocks: ["raanana"],
  },
  {
    level: 5,
    minXp: 720,
    nameHe: "אולפן ה׳",
    nameEn: "Ulpan Hey",
    unlocks: [],
  },
]

export const HINT_COST = 50
export const WORD_HINT_COST = 1
export const TRANSIT_FARE = 15
export const MISTAKE_PENALTY = 5

export function levelFromXp(xp: number) {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level
  }
  return current
}

export function nextLevel(xp: number) {
  const current = levelFromXp(xp)
  return LEVELS.find((level) => level.level === current.level + 1) ?? null
}

export function xpProgress(xp: number) {
  const current = levelFromXp(xp)
  const upcoming = nextLevel(xp)
  if (!upcoming) return 100
  const span = upcoming.minXp - current.minXp
  return Math.min(100, Math.round(((xp - current.minXp) / span) * 100))
}

export function cityUnlocked(city: CitySlug, playerLevel: number) {
  if (city === "tel-aviv") return true
  if (city === "jerusalem") return playerLevel >= 2
  return playerLevel >= 4
}

export function requiredLevelForCity(city: CitySlug) {
  if (city === "jerusalem") return LEVELS[1]
  if (city === "raanana") return LEVELS[3]
  return LEVELS[0]
}
