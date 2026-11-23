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

export type MissionOption = {
  text: string
  englishTranslation: string
  isCorrect: boolean
  nextNode?: string
  feedback?: string
}

export type WordBank = Record<string, string>

export type MissionNode = {
  id: string
  speaker: string
  hebrewText: string
  englishTranslation: string
  wordBank?: WordBank
  options: MissionOption[]
}

export type MissionScript = {
  id: string
  title: string
  englishTitle: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  xpReward: number
  shekelReward: number
  setupText: string
  nodes: MissionNode[]
}

export type Mission = MissionScript & {
  city: CitySlug
  minLevel: number
  setupHebrew: string
}

export type HintLine = {
  he: string
  en: string
}

export type TravelResult =
  | { ok: true; cost: number }
  | { ok: false; reasonHe: string; reasonEn: string }
