import type {
  CatalogItem,
  DiningId,
  Inventory,
  PhoneId,
  PropertyId,
  VehicleId,
} from "@/lib/types"

export const VEHICLES: CatalogItem[] = [
  {
    id: "rav-kav",
    category: "vehicle",
    tier: 1,
    price: 80,
    nameHe: "רב-קו",
    nameEn: "Rav-Kav transit pass",
    blurbHe: "אוטובוס, רכבת קלה, ושירות — בלי מזומן מתחת לכיסא.",
    blurbEn: "Bus, light rail, and sherut — no cash under the seat.",
  },
  {
    id: "korkinet",
    category: "vehicle",
    tier: 2,
    price: 1800,
    nameHe: "קורקינט חשמלי",
    nameEn: "Electric scooter",
    blurbHe: "ליים על רוטשילד. מצוין בעיר, חסר תועלת בגבעות.",
    blurbEn: "Lime on Rothschild. Great in the city, useless in the hills.",
  },
  {
    id: "mazda",
    category: "vehicle",
    tier: 3,
    price: 12000,
    nameHe: "מאזדה משומשת",
    nameEn: "Used Mazda",
    blurbHe: "רכב אמין לירושלים. המזגן עובד בערך.",
    blurbEn: "A reliable car for Jerusalem. The A/C mostly works.",
  },
  {
    id: "tesla",
    category: "vehicle",
    tier: 4,
    price: 45000,
    nameHe: "טסלה חדשה",
    nameEn: "New Tesla",
    blurbHe: "שקט, יקר, וכולם ברעננה כבר יודעים שקנית.",
    blurbEn: "Quiet, expensive, and everyone in Raanana already noticed.",
  },
]

export const PROPERTIES: CatalogItem[] = [
  {
    id: "hostel",
    category: "property",
    tier: 1,
    price: 400,
    nameHe: "מיטת הוסטל",
    nameEn: "Hostel bed",
    blurbHe: "תיק מתחת למיטה, מקלחת בקומה, ושיחות ב־03:00.",
    blurbEn: "Bag under the bed, shower down the hall, chats at 3 a.m.",
  },
  {
    id: "ta-share",
    category: "property",
    tier: 2,
    price: 8000,
    nameHe: "דירת שותפים בתל אביב",
    nameEn: "Shared Tel Aviv apartment",
    blurbHe: "באוהאוס קטן. המרפסת שווה את הרעש.",
    blurbEn: "A tiny Bauhaus flat. The balcony is worth the noise.",
  },
  {
    id: "jer-stone",
    category: "property",
    tier: 3,
    price: 22000,
    nameHe: "דירת אבן בירושלים",
    nameEn: "Jerusalem stone apartment",
    blurbHe: "קירות עבים, רצפת שיש, ושכנים שאומרים שבת שלום.",
    blurbEn: "Thick walls, stone floors, neighbors who say Shabbat shalom.",
  },
  {
    id: "raanana-villa",
    category: "property",
    tier: 4,
    price: 60000,
    nameHe: "וילה ברעננה",
    nameEn: "Raanana villa",
    blurbHe: "גינה, חניה, ושלושה חדרי שינה. החיים האמיתיים.",
    blurbEn: "Garden, parking, three bedrooms. The real life.",
  },
]

export const PHONES: CatalogItem[] = [
  {
    id: "basic",
    category: "phone",
    tier: 1,
    price: 0,
    nameHe: "טלפון בסיסי",
    nameEn: "Basic phone",
    blurbHe: "שיחות וסמסים. וואטסאפ בקושי.",
    blurbEn: "Calls and SMS. WhatsApp barely.",
    starter: true,
  },
  {
    id: "smartphone",
    category: "phone",
    tier: 2,
    price: 2500,
    nameHe: "סמארטפון חדש",
    nameEn: "Latest smartphone",
    blurbHe: "מפות, ביט, ומשרד הפנים באפליקציה.",
    blurbEn: "Maps, Bit, and the Interior Ministry in an app.",
  },
]

export const DINING: CatalogItem[] = [
  {
    id: "street",
    category: "dining",
    tier: 1,
    price: 0,
    nameHe: "אוכל רחוב",
    nameEn: "Street food",
    blurbHe: "פלאפל, פיתה, ומפיות על הברך.",
    blurbEn: "Falafel, pita, napkins on your knee.",
    starter: true,
  },
  {
    id: "fine",
    category: "dining",
    tier: 2,
    price: 1200,
    nameHe: "מסעדה שף",
    nameEn: "Fine dining",
    blurbHe: "תפריט בעברית בלבד. אל תבקשו תרגום מהמלצר.",
    blurbEn: "Hebrew-only menu. Do not ask the waiter to translate.",
  },
]

export const CATALOG: CatalogItem[] = [
  ...VEHICLES,
  ...PROPERTIES,
  ...PHONES,
  ...DINING,
]

export function getCatalogItem(id: string) {
  return CATALOG.find((item) => item.id === id)
}

export function ownedTier(inventory: Inventory, category: CatalogItem["category"]) {
  if (category === "vehicle") {
    const owned = VEHICLES.find((item) => item.id === inventory.vehicle)
    return owned?.tier ?? 0
  }
  if (category === "property") {
    const owned = PROPERTIES.find((item) => item.id === inventory.property)
    return owned?.tier ?? 0
  }
  if (category === "phone") {
    return PHONES.find((item) => item.id === inventory.phone)?.tier ?? 1
  }
  return DINING.find((item) => item.id === inventory.dining)?.tier ?? 1
}

export function isOwned(inventory: Inventory, item: CatalogItem) {
  if (item.category === "vehicle") return inventory.vehicle === item.id
  if (item.category === "property") return inventory.property === item.id
  if (item.category === "phone") return inventory.phone === item.id
  return inventory.dining === item.id
}

export function canPurchase(inventory: Inventory, item: CatalogItem) {
  if (item.starter) return false
  if (isOwned(inventory, item)) return false
  return ownedTier(inventory, item.category) < item.tier
}

export function applyPurchase(inventory: Inventory, item: CatalogItem): Inventory {
  if (item.category === "vehicle") {
    return { ...inventory, vehicle: item.id as VehicleId }
  }
  if (item.category === "property") {
    return { ...inventory, property: item.id as PropertyId }
  }
  if (item.category === "phone") {
    return { ...inventory, phone: item.id as PhoneId }
  }
  return { ...inventory, dining: item.id as DiningId }
}

export function ownedVehicleItem(inventory: Inventory) {
  return VEHICLES.find((item) => item.id === inventory.vehicle) ?? null
}

export function ownedPropertyItem(inventory: Inventory) {
  return PROPERTIES.find((item) => item.id === inventory.property) ?? null
}
