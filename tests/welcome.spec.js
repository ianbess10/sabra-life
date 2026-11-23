import { expect, test } from "@playwright/test"

import { gotoApp } from "./helpers/app.js"
import { mockSupabase } from "./helpers/supabase-mock.js"

test.describe("Welcome briefing", () => {
  test("shows the beta how-to-play on a first visit", async ({ page }) => {
    await mockSupabase(page)
    await page.goto("/")
    await expect(page.getByTestId("welcome-modal")).toBeVisible()
    await expect(page.getByText("Welcome to Sabra Life")).toBeVisible()
    await expect(page.getByText("Your New Immigrant Survival Simulator")).toBeVisible()
    await expect(page.getByText(/oleh chadash/i)).toBeVisible()
    await expect(page.getByText(/₪200/)).toBeVisible()
    await expect(page.getByText(/Dashed words cost ₪1/)).toBeVisible()
    await expect(page.getByText(/Beta testers/)).toBeVisible()
  })

  test("dismisses once and the HUD can open it again", async ({ page }) => {
    await gotoApp(page, "/")
    await expect(page.getByTestId("welcome-modal")).toBeHidden()

    await page.reload()
    await expect(page.getByTestId("hud-shekels")).toBeVisible()
    await expect(page.getByTestId("welcome-modal")).toBeHidden()

    await page.getByTestId("open-welcome").click()
    await expect(page.getByTestId("welcome-modal")).toBeVisible()
    await page.getByTestId("welcome-dismiss").click()
    await expect(page.getByTestId("welcome-modal")).toBeHidden()
  })
})
