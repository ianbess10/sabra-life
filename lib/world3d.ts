import type { WorldMap } from "@/lib/world"

export const WORLD_SCALE = 0.1

export type LiveActor = {
  id: string
  kind: "ped" | "cop" | "car"
  x: number
  y: number
  vx: number
  vy: number
  color: string
  line: string | null
  w: number
  h: number
}

export type LiveWorld = {
  x: number
  y: number
  facing: number
  moving: boolean
  driving: boolean
  taxiRide: boolean
  gender: "male" | "female"
  wanted: number
  nextId: string | null
  actors: LiveActor[]
  maggieX: number
  maggieY: number
  maggieFacing: number
  maggieMoving: boolean
  maggieSitting: boolean
  maggieLine: string | null
}

export function to3(x: number, y: number, lift = 0): [number, number, number] {
  return [x * WORLD_SCALE, lift, y * WORLD_SCALE]
}

export function sx(n: number) {
  return n * WORLD_SCALE
}

export function buildingHeight(label: string | undefined, index: number) {
  if (label === "נתב״ג") return 16
  if (label === "מוניות") return 7
  if (label === "בנק") return 12
  if (label === "אולפן") return 10
  if (label === "קופ״ח") return 9
  if (label === "סופר") return 8
  if (label === "קפה") return 7
  if (label === "שוק") return 6
  if (label === "השכרה") return 8
  if (label === "דלק") return 5
  if (label === "תחנה") return 6
  if (label === "רישוי") return 9
  return 6 + (index % 6) * 1.6
}

export function mapExtent(map: WorldMap) {
  return { w: sx(map.w), h: sx(map.h) }
}
