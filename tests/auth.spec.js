import { expect, test } from "@playwright/test"

import { getGameState, gotoApp, hudShekels } from "./helpers/app.js"
import { E2E_EMAIL, E2E_PASSWORD } from "./helpers/supabase-mock.js"

const CLOUD = {
  shekels: 777,
  xp: 420,
  current_streak: 4,
  longest_streak: 6,
  last_mission_date: "2026-11-20",
  completed_missions: ["ta_shuk_01"],
  location: "tel-aviv",
}

test.describe("Suite 1: Authentication & State Hydration", () => {
  test("Test A: User can successfully sign up and log in", async ({ page }) => {
    await gotoApp(page, "/")

    await page.getByTestId("open-login").click()
    await page.getByTestId("login-mode-signup").click()
    await page.getByTestId("login-email").fill(E2E_EMAIL)
    await page.getByTestId("login-password").fill(E2E_PASSWORD)
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("sign-out")).toBeVisible()
    await expect(page.getByTestId("open-login")).toHaveCount(0)

    await page.getByTestId("sign-out").click()
    await expect(page.getByTestId("open-login")).toBeVisible()

    await page.getByTestId("open-login").click()
    await page.getByTestId("login-mode-signin").click()
    await page.getByTestId("login-email").fill(E2E_EMAIL)
    await page.getByTestId("login-password").fill(E2E_PASSWORD)
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("sign-out")).toBeVisible()
    await expect(page.getByText("התחברת. ההתקדמות מסונכרנת.").first()).toBeVisible()
  })

  test("Test B: Upon login, the Zustand store hydrates from mocked Supabase", async ({
    page,
  }) => {
    await gotoApp(page, "/", {
      profile: CLOUD,
      inventory: {
        vehicle: "mazda",
        property: "hostel",
        phone: "smartphone",
        dining: "fine",
      },
    })

    await page.getByTestId("open-login").click()
    await page.getByTestId("login-email").fill(E2E_EMAIL)
    await page.getByTestId("login-password").fill(E2E_PASSWORD)
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("sign-out")).toBeVisible()
    await expect
      .poll(async () => (await getGameState(page)).xp)
      .toBe(CLOUD.xp)
    await expect
      .poll(async () => (await getGameState(page)).shekels)
      .toBe(CLOUD.shekels)
    await expect
      .poll(async () => (await getGameState(page)).currentStreak)
      .toBe(CLOUD.current_streak)
    await expect
      .poll(async () => (await getGameState(page)).inventory.vehicle)
      .toBe("mazda")

    await expect.poll(() => hudShekels(page)).toBe(CLOUD.shekels)
    await expect(page.getByTestId("hud-streak")).toContainText(String(CLOUD.current_streak))
    await expect(page.getByTestId("hud-vehicle")).toContainText("מאזדה משומשת")
  })
})
