import { JERUSALEM_MISSIONS } from "@/lib/missions/jerusalem"
import { RAANANA_MISSIONS } from "@/lib/missions/raanana"
import { TEL_AVIV_MISSIONS } from "@/lib/missions/tel-aviv"
import type { CitySlug, Mission } from "@/lib/types"

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
