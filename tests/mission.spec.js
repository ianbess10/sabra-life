import { expect, test } from "@playwright/test"

import {
  CAFE_ANSWERS,
  CAFE_REWARD,
  DEFAULT_SHEKELS,
  MISTAKE_PENALTY,
  STREAK_BONUS,
  completeCafeMission,
  getGameState,
  gotoApp,
  hudShekels,
  openCafeMission,
  signInAsTestUser,
  waitForSyncWrite,
} from "./helpers/app.js"

test.describe("Suite 2: Core Mission Engine & Economy", () => {
  test("Test A: Correct answer advances to the next node", async ({ page }) => {
    await gotoApp(page, "/")
    await openCafeMission(page)
    await expect(page.getByText(CAFE_ANSWERS.node1Prompt)).toBeVisible()

    await page.getByRole("button", { name: CAFE_ANSWERS.node1Correct }).click()

    await expect(page.getByText(CAFE_ANSWERS.node2Prompt)).toBeVisible()
    await expect(page.getByText(CAFE_ANSWERS.node1Prompt)).toHaveCount(0)
  })

  test("Test B: Wrong answer deducts ₪5 and shows feedback", async ({ page }) => {
    await gotoApp(page, "/")
    const before = await hudShekels(page)
    await openCafeMission(page)

    await page.getByRole("button", { name: CAFE_ANSWERS.node1Wrong }).click()

    await expect(page.getByText("The waiter looks confused. Try again.")).toBeVisible()
    await expect.poll(() => hudShekels(page)).toBe(before - MISTAKE_PENALTY)
    await expect(page.getByText(CAFE_ANSWERS.node1Prompt)).toBeVisible()
  })

  test("Test C: Completing the cafe pays XP, shekels, and syncs to Supabase", async ({
    page,
  }) => {
    const mock = await gotoApp(page, "/", { session: true })
    await signInAsTestUser(page)
    mock.writes.length = 0
    await completeCafeMission(page)

    const expectedShekels = DEFAULT_SHEKELS + CAFE_REWARD.shekels + STREAK_BONUS
    await expect.poll(() => hudShekels(page)).toBe(expectedShekels)

    const state = await getGameState(page)
    expect(state.xp).toBe(CAFE_REWARD.xp)
    expect(state.shekels).toBe(expectedShekels)
    expect(state.completedMissions).toContain("ta_cafe_01")

    const write = await waitForSyncWrite(mock, "profiles")
    expect(write.row.xp).toBe(CAFE_REWARD.xp)
    expect(write.row.shekels).toBe(expectedShekels)
    expect(write.row.completed_missions).toContain("ta_cafe_01")
  })
})
