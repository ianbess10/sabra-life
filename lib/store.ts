"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  applyPurchase,
  canPurchase,
  getCatalogItem,
} from "@/lib/catalog"
import {
  fetchCloudProgress,
  progressScore,
  saveCloudProgress,
  type CloudProgress,
} from "@/lib/cloud"
import type { Gender } from "@/lib/gender"
import { HINT_COST, MISTAKE_PENALTY, levelFromXp } from "@/lib/levels"
import { getMission } from "@/lib/missions"
import { STREAK_BONUS_SHEKELS, calculateStreak } from "@/lib/streak"
import { canTravelTo } from "@/lib/travel"
import type { CitySlug, Inventory } from "@/lib/types"
import { worldForCity } from "@/lib/world"
import { isSupabaseConfigured } from "@/utils/supabase/env"

export type SyncStatus = "idle" | "saving" | "saved" | "offline" | "error"

export type GameState = {
  shekels: number
  xp: number
  location: CitySlug
  inventory: Inventory
  completedMissions: string[]
  currentStreak: number
  longestStreak: number
  lastMissionDate: string | null
  hasHydrated: number
  syncStatus: SyncStatus
  userId: string | null
  sawWelcome: boolean
  welcomeOpen: boolean
  gender: Gender
  worldX: number
  worldY: number
  wanted: number
  inVehicle: boolean
  showWelcome: () => void
  dismissWelcome: () => void
  setGender: (gender: Gender) => void
  setWorldPos: (x: number, y: number) => void
  setWanted: (stars: number) => void
  setInVehicle: (value: boolean) => void
  spend: (amount: number) => boolean
  buyHint: () => boolean
  penalizeMistake: () => number
  completeMission: (missionId: string) => {
    paid: boolean
    shekels: number
    xp: number
    bonus: boolean
    streak: number
  }
  addReward: (missionId: string) => {
    paid: boolean
    shekels: number
    xp: number
    bonus: boolean
    streak: number
  }
  buyItem: (itemId: string) => { ok: boolean; messageHe: string; messageEn: string }
  purchaseItem: (itemId: string) => { ok: boolean; messageHe: string; messageEn: string }
  travelTo: (city: CitySlug) => {
    ok: boolean
    cost: number
    messageHe: string
    messageEn: string
  }
  reset: () => void
  setHydrated: () => void
  setSyncStatus: (status: SyncStatus) => void
  setUserId: (userId: string | null) => void
  syncWithCloud: () => Promise<void>
  pushToCloud: () => Promise<void>
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
  currentStreak: 0,
  longestStreak: 0,
  lastMissionDate: null as string | null,
  syncStatus: "idle" as SyncStatus,
  sawWelcome: false,
  gender: "male" as Gender,
  worldX: worldForCity("tel-aviv").spawn.x,
  worldY: worldForCity("tel-aviv").spawn.y,
  wanted: 0,
  inVehicle: false,
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function snapshot(state: GameState): CloudProgress {
  return {
    shekels: state.shekels,
    xp: state.xp,
    location: state.location,
    inventory: state.inventory,
    completedMissions: state.completedMissions,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastMissionDate: state.lastMissionDate,
  }
}

function scheduleCloudPush() {
  if (!isSupabaseConfigured()) {
    useGameStore.setState({ syncStatus: "offline" })
    return
  }
  useGameStore.setState({ syncStatus: "saving" })
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void useGameStore.getState().pushToCloud()
  }, 450)
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: 0,
      userId: null,
      welcomeOpen: false,
      showWelcome: () => set({ welcomeOpen: true }),
      dismissWelcome: () => set({ sawWelcome: true, welcomeOpen: false }),
      setGender: (gender) => set({ gender }),
      setWorldPos: (x, y) => set({ worldX: x, worldY: y }),
      setWanted: (stars) => set({ wanted: Math.max(0, Math.min(5, stars)) }),
      setInVehicle: (value) => set({ inVehicle: value }),
      spend: (amount) => {
        if (amount <= 0) return true
        if (get().shekels < amount) return false
        set({ shekels: get().shekels - amount })
        scheduleCloudPush()
        return true
      },
      buyHint: () => {
        if (get().shekels < HINT_COST) return false
        set({ shekels: get().shekels - HINT_COST })
        scheduleCloudPush()
        return true
      },
      penalizeMistake: () => {
        const deducted = Math.min(MISTAKE_PENALTY, get().shekels)
        if (deducted > 0) set({ shekels: get().shekels - deducted })
        scheduleCloudPush()
        return deducted
      },
      completeMission: (missionId) => {
        const mission = getMission(missionId)
        if (!mission) {
          return { paid: false, shekels: 0, xp: 0, bonus: false, streak: get().currentStreak }
        }
        const alreadyDone = get().completedMissions.includes(missionId)
        const streak = calculateStreak(get().lastMissionDate, get().currentStreak)
        const bonusShekels = streak.bonus ? STREAK_BONUS_SHEKELS : 0
        const missionShekels = alreadyDone ? 0 : mission.shekelReward
        const xp = alreadyDone ? 0 : mission.xpReward
        const shekels = missionShekels + bonusShekels
        set({
          shekels: get().shekels + shekels,
          xp: get().xp + xp,
          completedMissions: alreadyDone
            ? get().completedMissions
            : [...get().completedMissions, missionId],
          currentStreak: streak.streak,
          longestStreak: Math.max(get().longestStreak, streak.streak),
          lastMissionDate: streak.lastMissionDate,
        })
        scheduleCloudPush()
        return {
          paid: !alreadyDone,
          shekels,
          xp,
          bonus: streak.bonus,
          streak: streak.streak,
        }
      },
      addReward: (missionId) => get().completeMission(missionId),
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
        scheduleCloudPush()
        return {
          ok: true,
          messageHe: `קנית ${item.nameHe}`,
          messageEn: `You bought ${item.nameEn}`,
        }
      },
      purchaseItem: (itemId) => get().buyItem(itemId),
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
        const spawn = worldForCity(city).spawn
        if (result.cost > 0) {
          set({
            shekels: state.shekels - result.cost,
            location: city,
            worldX: spawn.x,
            worldY: spawn.y,
            inVehicle: false,
          })
        } else {
          set({ location: city, worldX: spawn.x, worldY: spawn.y, inVehicle: false })
        }
        scheduleCloudPush()
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
      reset: () => {
        set({
          ...initialState,
          gender: get().gender,
          inventory: { ...initialInventory },
          welcomeOpen: true,
        })
        scheduleCloudPush()
      },
      setHydrated: () => set({ hasHydrated: 1 }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setUserId: (userId) => set({ userId }),
      syncWithCloud: async () => {
        if (!isSupabaseConfigured()) {
          set({ syncStatus: "offline" })
          return
        }
        set({ syncStatus: "saving" })
        const result = await fetchCloudProgress()
        if (!result.ok) {
          if (result.reason === "missing") {
            await get().pushToCloud()
            return
          }
          if (result.reason === "error") set({ syncStatus: "error" })
          else set({ syncStatus: "offline" })
          return
        }
        const cloud = result.progress
        const local = snapshot(get())
        if (progressScore(local) > progressScore(cloud)) {
          await get().pushToCloud()
          return
        }
        set({
          shekels: cloud.shekels,
          xp: cloud.xp,
          location: cloud.location,
          inventory: cloud.inventory,
          completedMissions: cloud.completedMissions,
          currentStreak: cloud.currentStreak,
          longestStreak: cloud.longestStreak,
          lastMissionDate: cloud.lastMissionDate,
          syncStatus: "saved",
        })
      },
      pushToCloud: async () => {
        if (!isSupabaseConfigured()) {
          set({ syncStatus: "offline" })
          return
        }
        set({ syncStatus: "saving" })
        const result = await saveCloudProgress(snapshot(get()))
        if (result.ok) set({ syncStatus: "saved" })
        else if (result.reason === "signed-out" || result.reason === "offline") {
          set({ syncStatus: "offline" })
        } else {
          set({ syncStatus: "error" })
        }
      },
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
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastMissionDate: state.lastMissionDate,
        sawWelcome: state.sawWelcome,
        gender: state.gender,
        worldX: state.worldX,
        worldY: state.worldY,
      }),
    }
  )
)

export function usePlayerLevel() {
  return useGameStore((state) => levelFromXp(state.xp))
}
