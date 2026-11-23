import { expect, test } from "@playwright/test"

import {
  completeCafeMission,
  freezeDate,
  getGameState,
  gotoApp,
  setGameState,
} from "./helpers/app.js"

const TODAY = "2026-11-23T12:00:00"

test.describe("Suite 5: Daily Streak Mechanics", () => {
  test("Test A: Mission 24h after last play increments streak, lights the flame, and pays a bonus", async ({
    page,
  }) => {
    await freezeDate(page, TODAY)
    await gotoApp(page, "/", { session: true })
    await setGameState(page, {
      shekels: 200,
      xp: 0,
      completedMissions: [],
      currentStreak: 3,
      longestStreak: 3,
      lastMissionDate: "2026-11-22",
    })

    await completeCafeMission(page)

    await expect.poll(async () => (await getGameState(page)).currentStreak).toBe(4)
    await expect(page.getByTestId("hud-streak")).toContainText("4")
    await expect(page.getByTestId("hud-flame")).toHaveClass(/text-orange-500/)
    await expect(page.getByText("Streak Bonus Applied").first()).toBeVisible()
    await expect(page.locator("p.text-orange-500").first()).toContainText("בונוס רצף")

    const state = await getGameState(page)
    expect(state.lastMissionDate).toBe("2026-11-23")
    expect(state.shekels).toBe(200 + 20 + 10)
  })

  test("Test B: Mission 48h after last play resets current_streak to 1", async ({
    page,
  }) => {
    await freezeDate(page, TODAY)
    await gotoApp(page, "/", { session: true })
    await setGameState(page, {
      shekels: 200,
      xp: 0,
      completedMissions: [],
      currentStreak: 5,
      longestStreak: 5,
      lastMissionDate: "2026-11-21",
    })

    await completeCafeMission(page)

    await expect.poll(async () => (await getGameState(page)).currentStreak).toBe(1)
    await expect(page.getByTestId("hud-streak")).toContainText("1")
    const state = await getGameState(page)
    expect(state.lastMissionDate).toBe("2026-11-23")
  })
})
