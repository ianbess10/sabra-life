export type CitySlug = "tel-aviv" | "jerusalem" | "raanana"

export type VehicleId = "rav-kav" | "korkinet" | "mazda" | "tesla"
export type PropertyId = "hostel" | "ta-share" | "jer-stone" | "raanana-villa"
export type PhoneId = "basic" | "smartphone"
export type DiningId = "street" | "fine"

export type Inventory = {
  vehicle: VehicleId | null
  property: PropertyId | null
  phone: PhoneId
  dining: DiningId
}

export type CatalogCategory = "vehicle" | "property" | "phone" | "dining"

export type CatalogItem = {
  id: VehicleId | PropertyId | PhoneId | DiningId
  category: CatalogCategory
  tier: number
  price: number
  nameHe: string
  nameEn: string
  blurbHe: string
  blurbEn: string
  starter?: boolean
}

export type MissionChoice = {
  id: string
  textHe: string
  textEn: string
  correct: boolean
  reactionHe: string
  reactionEn: string
}

export type MissionStep = {
  id: string
  npcHe: string
  npcEn: string
  promptHe: string
  promptEn: string
  type: "choice" | "type"
  choices?: MissionChoice[]
  acceptedAnswers?: string[]
  typePlaceholderHe?: string
  typePlaceholderEn?: string
  failHe: string
  failEn: string
}

export type Mission = {
  id: string
  city: CitySlug
  titleHe: string
  titleEn: string
  summaryHe: string
  summaryEn: string
  minLevel: number
  rewardShekels: number
  rewardXp: number
  reducedRewardShekels: number
  steps: MissionStep[]
  successHe: string
  successEn: string
}

export type HintLine = {
  he: string
  en: string
}

export type TravelResult =
  | { ok: true; cost: number }
  | { ok: false; reasonHe: string; reasonEn: string }
