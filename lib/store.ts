"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  applyPurchase,
  canPurchase,
  getCatalogItem,
} from "@/lib/catalog"
import { HINT_COST, levelFromXp } from "@/lib/levels"
import { getMission } from "@/lib/missions"
import { canTravelTo } from "@/lib/travel"
import type { CitySlug, Inventory } from "@/lib/types"

export type GameState = {
  shekels: number
  xp: number
  location: CitySlug
  inventory: Inventory
  completedMissions: string[]
  failedAttempts: Record<string, number>
  hasHydrated: number
  spend: (amount: number) => boolean
  buyHint: () => boolean
  recordFail: (missionId: string) => void
  completeMission: (missionId: string) => {
    paid: boolean
    shekels: number
    xp: number
  }
  buyItem: (itemId: string) => { ok: boolean; messageHe: string; messageEn: string }
  travelTo: (city: CitySlug) => {
    ok: boolean
    cost: number
    messageHe: string
    messageEn: string
  }
  reset: () => void
  setHydrated: () => void
}

const initialInventory: Inventory = {
  vehicle: null,
  property: null,
  phone: "basic",
  dining: "street",
}

const initialState = {
  shekels: 200,
  xp: 0,
  location: "tel-aviv" as CitySlug,
  inventory: initialInventory,
  completedMissions: [] as string[],
  failedAttempts: {} as Record<string, number>,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: 0,
      spend: (amount) => {
        if (amount <= 0) return true
        if (get().shekels < amount) return false
        set({ shekels: get().shekels - amount })
        return true
      },
      buyHint: () => {
        if (get().shekels < HINT_COST) return false
        set({ shekels: get().shekels - HINT_COST })
        return true
      },
      recordFail: (missionId) => {
        const current = get().failedAttempts[missionId] ?? 0
        set({
          failedAttempts: {
            ...get().failedAttempts,
            [missionId]: current + 1,
          },
        })
      },
      completeMission: (missionId) => {
        const mission = getMission(missionId)
        if (!mission) return { paid: false, shekels: 0, xp: 0 }
        if (get().completedMissions.includes(missionId)) {
          return { paid: false, shekels: 0, xp: 0 }
        }
        const failed = (get().failedAttempts[missionId] ?? 0) > 0
        const reward = failed ? mission.reducedRewardShekels : mission.rewardShekels
        set({
          shekels: get().shekels + reward,
          xp: get().xp + mission.rewardXp,
          completedMissions: [...get().completedMissions, missionId],
        })
        return { paid: true, shekels: reward, xp: mission.rewardXp }
      },
      buyItem: (itemId) => {
        const item = getCatalogItem(itemId)
        if (!item) {
          return { ok: false, messageHe: "הפריט לא נמצא", messageEn: "Item not found" }
        }
        if (!canPurchase(get().inventory, item)) {
          if (item.starter) {
            return {
              ok: false,
              messageHe: "זה כבר שלך",
              messageEn: "You already have this",
            }
          }
          return {
            ok: false,
            messageHe: "כבר יש לך משהו ברמה הזו או גבוהה יותר",
            messageEn: "You already own this tier or better",
          }
        }
        if (get().shekels < item.price) {
          return {
            ok: false,
            messageHe: "אין מספיק כסף בחשבון",
            messageEn: "Not enough money in the account",
          }
        }
        set({
          shekels: get().shekels - item.price,
          inventory: applyPurchase(get().inventory, item),
        })
        return {
          ok: true,
          messageHe: `קנית ${item.nameHe}`,
          messageEn: `You bought ${item.nameEn}`,
        }
      },
      travelTo: (city) => {
        const state = get()
        const level = levelFromXp(state.xp).level
        const result = canTravelTo(
          city,
          state.location,
          level,
          state.inventory,
          state.shekels
        )
        if (!result.ok) {
          return {
            ok: false,
            cost: 0,
            messageHe: result.reasonHe,
            messageEn: result.reasonEn,
          }
        }
        if (result.cost > 0) {
          set({ shekels: state.shekels - result.cost, location: city })
        } else {
          set({ location: city })
        }
        return {
          ok: true,
          cost: result.cost,
          messageHe:
            result.cost > 0
              ? `נסעת. שילמת ₪${result.cost} על הדרך.`
              : "הגעת. הדרך הייתה חופשית.",
          messageEn:
            result.cost > 0
              ? `You traveled. You paid ₪${result.cost} for the ride.`
              : "You arrived. The trip was free.",
        }
      },
      reset: () => set({ ...initialState, inventory: { ...initialInventory } }),
      setHydrated: () => set({ hasHydrated: 1 }),
    }),
    {
      name: "sabra-life",
      skipHydration: true,
      partialize: (state) => ({
        shekels: state.shekels,
        xp: state.xp,
        location: state.location,
        inventory: state.inventory,
        completedMissions: state.completedMissions,
        failedAttempts: state.failedAttempts,
      }),
    }
  )
)

export function usePlayerLevel() {
  return useGameStore((state) => levelFromXp(state.xp))
}
