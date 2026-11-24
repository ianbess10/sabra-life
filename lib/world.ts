import type { CitySlug } from "@/lib/types"

export type Rect = { x: number; y: number; w: number; h: number }

export type Landmark = {
  id: string
  missionId: string
  nameHe: string
  nameEn: string
  x: number
  y: number
  color: string
}

export type Building = Rect & {
  fill: string
  label?: string
  roof?: string
}

export type Road = Rect & { name?: string }

export type ParkedCar = {
  x: number
  y: number
  facing: number
  color: string
  taxi?: boolean
}

export type Stall = Rect & { kind: "blue" | "red" }

export type WorldMap = {
  id: CitySlug
  w: number
  h: number
  spawn: { x: number; y: number }
  sea?: Rect
  sand?: Rect
  parks: Rect[]
  lots: Rect[]
  roads: Road[]
  buildings: Building[]
  landmarks: Landmark[]
  parked: ParkedCar[]
  stalls: Stall[]
}

export const PLAYER_R = 14
export const INTERACT_R = 56

export const PED_LINES = [
  "יאללה תזוז",
  "סליחה",
  "יש פקק",
  "אין חניה",
  "הירקון פקק",
  "רמזור אדום",
  "חם היום",
  "איפה האוטובוס?",
  "וואלה",
  "נו כבר",
  "שבת שלום",
  "יש לך אש?",
  "יאללה ביי",
]

export const COP_LINES = ["עצור!", "משטרה!", "רישיון בבקשה!"]

export const MAGGIE_LINES = ["ווף!", "הב הב", "וווף ווף", "מגי!"]

const ROAD_W = 70

function roadH(y: number, w: number, name?: string): Road {
  return { x: 0, y, w, h: ROAD_W, name }
}
function roadV(x: number, h: number, name?: string): Road {
  return { x, y: 0, w: ROAD_W, h, name }
}

function block(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  label?: string,
  roof?: string
): Building {
  return { x, y, w, h, fill, label, roof }
}

export function buildTelAviv(): WorldMap {
  const w = 2680
  const h = 2140
  const vx = [250, 640, 1040, 1440, 1840, 2240]
  const hy = [180, 520, 860, 1200, 1540, 1880]
  const roads: Road[] = [
    ...hy.map((y) => roadH(y, w)),
    ...vx.map((x, index) => roadV(x, h, index === 0 ? "hayarkon" : undefined)),
  ]
  const buildings: Building[] = []
  const parks: Rect[] = []
  const lots: Rect[] = []
  const inset = 22
  const carColors = ["#f8fafc", "#0f172a", "#b91c1c", "#1e3a8a", "#eab308", "#64748b", "#fb7185"]
  const fills = ["#d9cbb8", "#efe6d6", "#cfc3ae", "#e4d5c0", "#f2eadc", "#cbbba3"]
  const roofs = ["#8b3a32", "#6d4c41", "#7a2f2f", "#5c4033"]

  function cell(c: number, r: number): Rect {
    return {
      x: vx[c] + ROAD_W + inset,
      y: hy[r] + ROAD_W + inset,
      w: vx[c + 1] - vx[c] - ROAD_W - inset * 2,
      h: hy[r + 1] - hy[r] - ROAD_W - inset * 2,
    }
  }
  function door(c: number, r: number) {
    const rect = cell(c, r)
    return { x: rect.x + rect.w / 2, y: hy[r + 1] + ROAD_W / 2 }
  }

  const named: Record<
    string,
    { label: string; fill: string; roof: string; park?: boolean; lot?: boolean }
  > = {
    "0,0": { label: "חוף", fill: "#f4eee3", roof: "#2a6f8f", park: true },
    "0,1": { label: "מלון", fill: "#2a2438", roof: "#0f172a" },
    "0,2": { label: "דירות", fill: "#3b3348", roof: "#1e293b" },
    "1,0": { label: "חניה", fill: "#ead9c4", roof: "#1d4ed8", lot: true },
    "3,0": { label: "פארק", fill: "#c5ddb6", roof: "#3f7d4e", park: true },
    "4,0": { label: "דשא", fill: "#dce8d3", roof: "#4d8a5a", park: true },
    "1,1": { label: "קפה", fill: "#f0e6d8", roof: "#b45309" },
    "2,1": { label: "בנק", fill: "#e7dccb", roof: "#0f766e" },
    "3,1": { label: "קופ״ח", fill: "#e8eef2", roof: "#0369a1" },
    "4,1": { label: "שוק", fill: "#f3e1c8", roof: "#c2410c" },
    "1,2": { label: "אולפן", fill: "#ded3c4", roof: "#1e3a8a" },
    "2,2": { label: "רישוי", fill: "#e5d6c4", roof: "#a16207" },
    "3,2": { label: "סופר", fill: "#eadfcf", roof: "#4d7c0f" },
    "0,3": { label: "השכרה", fill: "#d6d0c8", roof: "#334155" },
    "1,3": { label: "דלק", fill: "#c9b8a6", roof: "#9a3412" },
    "2,3": { label: "תחנה", fill: "#ddd3c6", roof: "#166534" },
    "0,4": { label: "נתב״ג", fill: "#9aa3ad", roof: "#1e293b" },
    "1,4": { label: "מוניות", fill: "#b9c4ce", roof: "#eab308" },
  }

  for (let c = 0; c < vx.length - 1; c++) {
    for (let r = 0; r < hy.length - 1; r++) {
      const rect = cell(c, r)
      if (rect.w < 40 || rect.h < 40) continue
      const spec = named[`${c},${r}`]
      if (spec?.park) {
        parks.push(rect)
        continue
      }
      if (spec?.lot) {
        lots.push(rect)
        continue
      }
      buildings.push(
        block(
          rect.x,
          rect.y,
          rect.w,
          rect.h,
          spec?.fill ?? fills[(c + r) % fills.length],
          spec?.label,
          spec?.roof ?? roofs[(c * 3 + r) % roofs.length]
        )
      )
    }
  }

  const d = (c: number, r: number) => door(c, r)
  const airport = d(0, 4)
  const landmarks: Landmark[] = [
    { id: "airport", missionId: "bg_passport", nameHe: "נתב״ג", nameEn: "Ben Gurion", x: airport.x, y: airport.y, color: "#38bdf8" },
    { id: "taxi", missionId: "bg_taxi", nameHe: "מונית", nameEn: "Taxi", ...d(1, 4), color: "#facc15" },
    { id: "bank", missionId: "ta_bank_01", nameHe: "בנק", nameEn: "Bank", ...d(2, 1), color: "#14b8a6" },
    { id: "kupat", missionId: "ta_kupat", nameHe: "קופ״ח", nameEn: "Clinic", ...d(3, 1), color: "#22d3ee" },
    { id: "ulpan", missionId: "ta_ulpan", nameHe: "אולפן", nameEn: "Ulpan", ...d(1, 2), color: "#818cf8" },
    { id: "license", missionId: "ta_license", nameHe: "רישוי", nameEn: "Licensing", ...d(2, 2), color: "#fbbf24" },
    { id: "rental", missionId: "ta_rent_car", nameHe: "השכרה", nameEn: "Rental", ...d(0, 3), color: "#94a3b8" },
    { id: "fuel", missionId: "ta_fuel", nameHe: "דלק", nameEn: "Fuel", ...d(1, 3), color: "#fb923c" },
    { id: "beach", missionId: "ta_directions", nameHe: "חוף", nameEn: "Beach", ...d(0, 0), color: "#38bdf8" },
    { id: "parking", missionId: "ta_parking", nameHe: "חניה בהירקון", nameEn: "Hayarkon parking", ...d(1, 0), color: "#60a5fa" },
    { id: "cop", missionId: "ta_speeding", nameHe: "משטרה", nameEn: "Police", x: vx[0] + ROAD_W / 2, y: hy[3] + ROAD_W / 2, color: "#2563eb" },
    { id: "crash", missionId: "ta_accident", nameHe: "תאונה", nameEn: "Crash", x: vx[3] + ROAD_W / 2, y: hy[3] + ROAD_W / 2, color: "#ef4444" },
    { id: "grocery", missionId: "ta_grocery", nameHe: "סופר", nameEn: "Super", ...d(3, 2), color: "#84cc16" },
    { id: "park", missionId: "ta_park", nameHe: "פארק", nameEn: "Park", ...d(3, 0), color: "#4ade80" },
    { id: "cafe", missionId: "ta_cafe_01", nameHe: "קפה", nameEn: "Cafe", ...d(1, 1), color: "#d97706" },
    { id: "shuk", missionId: "ta_shuk_01", nameHe: "שוק", nameEn: "Market", ...d(4, 1), color: "#f97316" },
    { id: "bus", missionId: "ta_transit_01", nameHe: "תחנה", nameEn: "Station", ...d(2, 3), color: "#22c55e" },
  ]

  const parked: ParkedCar[] = []
  const stalls: Stall[] = []
  const hayarkon = vx[0]
  for (let i = 0; i < 7; i++) {
    const y = 160 + i * 250
    const west = i % 2 === 0
    parked.push({
      x: west ? hayarkon + 16 : hayarkon + ROAD_W - 16,
      y,
      facing: west ? Math.PI / 2 : -Math.PI / 2,
      color: carColors[i % carColors.length],
      taxi: i % 9 === 0,
    })
  }
  for (const lot of lots) {
    const cols = 3
    const rows = 3
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = lot.x + 48 + c * ((lot.w - 80) / Math.max(1, cols - 1))
        const y = lot.y + 36 + r * ((lot.h - 80) / Math.max(1, rows - 1))
        stalls.push({ x: x - 18, y: y - 22, w: 36, h: 48, kind: "blue" })
        if (r === 0) continue
        parked.push({
          x,
          y,
          facing: Math.PI / 2,
          color: carColors[(c * 3 + r) % carColors.length],
        })
      }
    }
  }
  stalls.push({
    x: hayarkon + ROAD_W + 4,
    y: 480,
    w: 28,
    h: 140,
    kind: "red",
  })

  return {
    id: "tel-aviv",
    w,
    h,
    spawn: { x: airport.x, y: airport.y + 36 },
    sea: { x: 0, y: 0, w: 200, h },
    sand: { x: 200, y: 0, w: 50, h },
    parks,
    lots,
    roads,
    buildings,
    landmarks,
    parked,
    stalls,
  }
}

export function buildJerusalem(): WorldMap {
  const w = 1600
  const h = 1400
  const roads = [
    roadH(200, w),
    roadH(600, w),
    roadH(1000, w),
    roadV(200, h),
    roadV(700, h),
    roadV(1200, h),
  ]
  const buildings: Building[] = [
    block(290, 290, 380, 280, "#e8dcc8", "משרד הפנים", "#78716c"),
    block(790, 290, 380, 280, "#f0e6d4", "מחנה יהודה", "#b45309"),
    block(290, 690, 380, 280, "#ddd3c4", "העיר העתיקה", "#a8a29e"),
    block(790, 690, 380, 280, "#e5d5c0", "אבן", "#57534e"),
  ]
  return {
    id: "jerusalem",
    w,
    h,
    spawn: { x: 500, y: 620 },
    parks: [{ x: 790, y: 690, w: 380, h: 80 }],
    lots: [],
    roads,
    buildings,
    landmarks: [
      { id: "misrad", missionId: "jer-misrad", nameHe: "משרד הפנים", nameEn: "Interior", x: 480, y: 430, color: "#a8a29e" },
      { id: "mahane", missionId: "jer-mahane", nameHe: "מחנה יהודה", nameEn: "Mahane Yehuda", x: 980, y: 430, color: "#f97316" },
      { id: "oldcity", missionId: "jer-oldcity", nameHe: "העיר העתיקה", nameEn: "Old City", x: 480, y: 830, color: "#d6d3d1" },
    ],
    parked: [],
    stalls: [],
  }
}

export function buildRaanana(): WorldMap {
  const w = 1500
  const h = 1300
  const roads = [roadH(180, w), roadH(560, w), roadH(940, w), roadV(180, h), roadV(680, h), roadV(1180, h)]
  const buildings: Building[] = [
    block(270, 270, 380, 250, "#e7eef2", "בנק", "#0f766e"),
    block(770, 270, 380, 250, "#efe8dc", "עירייה", "#a16207"),
    block(270, 650, 380, 250, "#e4e4e7", "הנהלה", "#334155"),
  ]
  return {
    id: "raanana",
    w,
    h,
    spawn: { x: 500, y: 500 },
    parks: [{ x: 770, y: 650, w: 380, h: 250 }],
    lots: [],
    roads,
    buildings,
    landmarks: [
      { id: "mortgage", missionId: "ra-mortgage", nameHe: "משכנתא", nameEn: "Mortgage", x: 460, y: 400, color: "#14b8a6" },
      { id: "arnona", missionId: "ra-arnona", nameHe: "ארנונה", nameEn: "Arnona", x: 960, y: 400, color: "#f59e0b" },
      { id: "board", missionId: "ra-boardroom", nameHe: "הנהלה", nameEn: "Boardroom", x: 460, y: 780, color: "#64748b" },
    ],
    parked: [],
    stalls: [],
  }
}

export function worldForCity(city: CitySlug) {
  if (city === "jerusalem") return buildJerusalem()
  if (city === "raanana") return buildRaanana()
  return buildTelAviv()
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function circleHitsRect(cx: number, cy: number, r: number, rect: Rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w)
  const ny = clamp(cy, rect.y, rect.y + rect.h)
  const dx = cx - nx
  const dy = cy - ny
  return dx * dx + dy * dy < r * r
}

export function blocked(map: WorldMap, x: number, y: number, r = PLAYER_R) {
  if (x < r || y < r || x > map.w - r || y > map.h - r) return true
  if (map.sea && circleHitsRect(x, y, r, map.sea)) return true
  return map.buildings.some((building) => circleHitsRect(x, y, r, building))
}

export function onRoad(map: WorldMap, x: number, y: number) {
  return map.roads.some(
    (road) => x >= road.x && x <= road.x + road.w && y >= road.y && y <= road.y + road.h
  )
}
