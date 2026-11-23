import { expect } from "@playwright/test"

import { E2E_EMAIL, E2E_PASSWORD, mockSupabase } from "./supabase-mock.js"

export const CAFE_ANSWERS = {
  node1Correct: "אני רוצה קפה הפוך בבקשה.",
  node1Wrong: "אני אוהב חתולים.",
  node2Correct: "גדול בבקשה, עם חלב שיבולת שועל.",
  node3Correct: "באשראי, בבקשה.",
  node1Prompt: "שלום, מה תרצה להזמין?",
  node2Prompt: "איזה גודל? קטן או גדול?",
}

export const CAFE_REWARD = { xp: 50, shekels: 20 }
export const STREAK_BONUS = 10
export const MISTAKE_PENALTY = 5
export const WORD_HINT_COST = 1
export const SCOOTER_PRICE = 1800
export const DEFAULT_SHEKELS = 200

export function parseIls(text) {
  const digits = String(text ?? "").replace(/[^\d-]/g, "")
  return digits ? Number(digits) : 0
}

export async function hudShekels(page) {
  await expect(page.getByTestId("hud-shekels")).toBeVisible()
  return parseIls(await page.getByTestId("hud-shekels").innerText())
}

export async function gotoApp(page, path = "/", mockOptions = {}) {
  const mock = await mockSupabase(page, mockOptions)
  await installSpeechSpy(page)
  await page.goto(path)
  await expect(page.getByTestId("hud-shekels")).toBeVisible({ timeout: 20_000 })
  await page.waitForFunction(() => Boolean(window.__SABRA_STORE__))
  await expect(page.getByTestId("welcome-dismiss")).toBeVisible()
  await page.getByTestId("welcome-dismiss").click()
  await expect(page.getByTestId("welcome-modal")).toBeHidden()
  return mock
}

export async function setGameState(page, partial) {
  await page.waitForFunction(() => Boolean(window.__SABRA_STORE__))
  await page.evaluate((state) => {
    window.__SABRA_STORE__.setState(state)
  }, partial)
}

export async function getGameState(page) {
  await page.waitForFunction(() => Boolean(window.__SABRA_STORE__))
  return page.evaluate(() => {
    const state = window.__SABRA_STORE__.getState()
    return {
      shekels: state.shekels,
      xp: state.xp,
      location: state.location,
      inventory: state.inventory,
      completedMissions: state.completedMissions,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastMissionDate: state.lastMissionDate,
      syncStatus: state.syncStatus,
      userId: state.userId,
    }
  })
}

export async function openPhone(page) {
  const panel = page.getByTestId("gta-phone-panel")
  if (await panel.isVisible().catch(() => false)) return
  await page.getByTestId("gta-phone").click()
  await expect(panel).toBeVisible()
}

export async function openCafeMission(page) {
  await openPhone(page)
  await page
    .getByTestId("mission-ta_cafe_01")
    .getByRole("button", { name: /התחל משימה|תרגול/ })
    .click()
  await expect(page.getByText("שלום, מה תרצה להזמין?")).toBeVisible()
}

export async function completeCafeMission(page) {
  await openCafeMission(page)
  await page.getByRole("button", { name: CAFE_ANSWERS.node1Correct }).click()
  await expect(page.getByText(CAFE_ANSWERS.node2Prompt)).toBeVisible()
  await page.getByRole("button", { name: CAFE_ANSWERS.node2Correct }).click()
  await expect(page.getByText("באשראי או במזומן?")).toBeVisible()
  await page.getByRole("button", { name: CAFE_ANSWERS.node3Correct }).click()
  await expect(page.getByTestId("mission-success")).toBeVisible()
}

export async function signInAsTestUser(page) {
  await page.getByTestId("open-login").click()
  await page.getByTestId("login-email").fill(E2E_EMAIL)
  await page.getByTestId("login-password").fill(E2E_PASSWORD)
  await page.getByTestId("login-submit").click()
  await expect(page.getByTestId("sign-out")).toBeVisible()
}

export async function installSpeechSpy(page) {
  await page.addInitScript(() => {
    window.__speakCalls = []
    const synth = window.speechSynthesis
    if (!synth) return
    synth.getVoices = () => []
    synth.speak = (utterance) => {
      window.__speakCalls.push({
        text: utterance.text,
        lang: utterance.lang,
      })
    }
  })
}

export async function freezeDate(page, isoLocal) {
  await page.addInitScript((value) => {
    const frozen = new Date(value).getTime()
    const RealDate = Date
    class FakeDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(frozen)
        else super(...args)
      }
      static now() {
        return frozen
      }
    }
    FakeDate.parse = RealDate.parse
    FakeDate.UTC = RealDate.UTC
    globalThis.Date = FakeDate
  }, isoLocal)
}

export async function waitForSyncWrite(mock, table, timeout = 8_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    const hit = mock.writes.find((entry) => entry.table === table)
    if (hit) return hit
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Timed out waiting for Supabase write to ${table}`)
}
