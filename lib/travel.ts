import { CITIES } from "@/lib/cities"
import { TRANSIT_FARE, cityUnlocked, requiredLevelForCity } from "@/lib/levels"
import type { CitySlug, Inventory, TravelResult } from "@/lib/types"

export function travelCost(vehicle: Inventory["vehicle"]) {
  if (vehicle === "mazda" || vehicle === "tesla") return 0
  return TRANSIT_FARE
}

export function canTravelTo(
  destination: CitySlug,
  location: CitySlug,
  level: number,
  inventory: Inventory,
  shekels: number
): TravelResult {
  const city = CITIES.find((item) => item.slug === destination)
  if (!city) {
    return { ok: false, reasonHe: "עיר לא מוכרת", reasonEn: "Unknown city" }
  }

  if (!cityUnlocked(destination, level)) {
    const required = requiredLevelForCity(destination)
    return {
      ok: false,
      reasonHe: `${city.nameHe} נעולה. צריך ${required.nameHe} (רמה ${required.level}).`,
      reasonEn: `${city.nameEn} is locked. Reach ${required.nameEn} (level ${required.level}).`,
    }
  }

  if (destination === location) {
    return { ok: true, cost: 0 }
  }

  const cost = travelCost(inventory.vehicle)
  if (shekels < cost) {
    return {
      ok: false,
      reasonHe: `אין מספיק כסף לנסיעה. צריך ₪${cost}.`,
      reasonEn: `Not enough money to travel. You need ₪${cost}.`,
    }
  }

  return { ok: true, cost }
}

export function travelNote(vehicle: Inventory["vehicle"]) {
  if (vehicle === "mazda" || vehicle === "tesla") {
    return {
      he: "הרכב שלך מכסה את הדרך. הנסיעה חופשית.",
      en: "Your car covers the trip. Travel is free.",
    }
  }
  if (vehicle === "korkinet") {
    return {
      he: "קורקינט לא יוצא מהעיר. אוטובוס או שירות — ₪15.",
      en: "A scooter cannot leave the city. Bus or sherut — ₪15.",
    }
  }
  if (vehicle === "rav-kav") {
    return {
      he: "עם רב-קו עולים לתחבורה ציבורית ב־₪15.",
      en: "With a Rav-Kav, public transit costs ₪15.",
    }
  }
  return {
    he: "ברגל משלמים ₪15 על אוטובוס או שירות.",
    en: "On foot you pay ₪15 for a bus or sherut.",
  }
}
