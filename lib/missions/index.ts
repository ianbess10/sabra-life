import { telAvivMissions } from "@/data/missions/tel-aviv-missions"
import { missionOrder } from "@/lib/chapters"
import { JERUSALEM_MISSIONS } from "@/lib/missions/jerusalem"
import { OLEH_CAMPAIGN } from "@/lib/missions/oleh-campaign"
import { RAANANA_MISSIONS } from "@/lib/missions/raanana"
import { TEL_AVIV_EXTRA } from "@/lib/missions/tel-aviv"
import type { CitySlug, Mission, MissionChapter, MissionScene } from "@/lib/types"

const TEL_AVIV_SETUPS: Record<string, Mission["setupHebrew"]> = {
  ta_cafe_01: {
    male: "אתה יושב בבית קפה אופנתי ברוטשילד. המלצר ניגש.",
    female: "את יושבת בבית קפה אופנתי ברוטשילד. המלצר ניגש.",
  },
  ta_shuk_01: {
    male: "אתה עומד מול דוכן ירקות רועש באמצע שוק הכרמל.",
    female: "את עומדת מול דוכן ירקות רועש באמצע שוק הכרמל.",
  },
}

const CLASSICS: Record<
  string,
  { chapter: MissionChapter; scene: MissionScene; order: number }
> = {
  ta_cafe_01: { chapter: "daily", scene: "cafe", order: 40 },
  ta_shuk_01: { chapter: "daily", scene: "shuk", order: 41 },
  ta_transit_01: { chapter: "daily", scene: "bus", order: 42 },
}

export const TEL_AVIV_MISSIONS: Mission[] = [
  ...OLEH_CAMPAIGN,
  ...telAvivMissions.map((mission) => ({
    ...mission,
    city: "tel-aviv" as const,
    minLevel: 1,
    setupHebrew: TEL_AVIV_SETUPS[mission.id] ?? mission.title,
    ...CLASSICS[mission.id],
  })),
  ...TEL_AVIV_EXTRA.map((mission) => ({
    ...mission,
    ...CLASSICS[mission.id],
  })),
]

export const MISSIONS: Mission[] = [
  ...TEL_AVIV_MISSIONS,
  ...JERUSALEM_MISSIONS.map((mission) => ({
    ...mission,
    chapter: mission.chapter ?? ("papers" as const),
    scene: mission.scene ?? ("office" as const),
    order: mission.order ?? 90,
  })),
  ...RAANANA_MISSIONS.map((mission) => ({
    ...mission,
    chapter: mission.chapter ?? ("papers" as const),
    scene: mission.scene ?? ("office" as const),
    order: mission.order ?? 100,
  })),
]

export function missionsForCity(city: CitySlug) {
  return MISSIONS.filter((mission) => mission.city === city).slice().sort(
    (a, b) => missionOrder(a) - missionOrder(b)
  )
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
