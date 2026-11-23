import { telAvivMissions } from "@/data/missions/tel-aviv-missions"
import { JERUSALEM_MISSIONS } from "@/lib/missions/jerusalem"
import { RAANANA_MISSIONS } from "@/lib/missions/raanana"
import { TEL_AVIV_EXTRA } from "@/lib/missions/tel-aviv"
import type { CitySlug, Mission } from "@/lib/types"

const TEL_AVIV_SETUPS: Record<string, string> = {
  ta_cafe_01: "אתה יושב בבית קפה אופנתי ברוטשילד. המלצר ניגש.",
  ta_shuk_01: "אתה עומד מול דוכן ירקות רועש באמצע שוק הכרמל.",
}

export const TEL_AVIV_MISSIONS: Mission[] = [
  ...telAvivMissions.map((mission) => ({
    ...mission,
    city: "tel-aviv" as const,
    minLevel: 1,
    setupHebrew: TEL_AVIV_SETUPS[mission.id] ?? mission.title,
  })),
  ...TEL_AVIV_EXTRA,
]

export const MISSIONS: Mission[] = [
  ...TEL_AVIV_MISSIONS,
  ...JERUSALEM_MISSIONS,
  ...RAANANA_MISSIONS,
]

export function missionsForCity(city: CitySlug) {
  return MISSIONS.filter((mission) => mission.city === city)
}

export function getMission(id: string) {
  return MISSIONS.find((mission) => mission.id === id)
}

export function nextAvailableMission(
  city: CitySlug,
  level: number,
  completed: string[]
) {
  return (
    missionsForCity(city).find(
      (mission) => mission.minLevel <= level && !completed.includes(mission.id)
    ) ?? null
  )
}
