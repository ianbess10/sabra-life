import { expect, test } from "@playwright/test"

import { gotoApp } from "./helpers/app.js"
import { mockSupabase } from "./helpers/supabase-mock.js"

test.describe("Hebrew gender profile", () => {
  test("female profile conjugates cafe Hebrew", async ({ page }) => {
    await mockSupabase(page)
    await page.goto("/")
    await expect(page.getByTestId("welcome-modal")).toBeVisible()
    await page.getByTestId("gender-female").click()
    await page.getByTestId("welcome-dismiss").click()

    await page
      .getByTestId("mission-ta_cafe_01")
      .getByRole("button", { name: /התחל משימה|תרגול/ })
      .click()

    await expect(page.getByText("שלום, מה תרצי להזמין?")).toBeVisible()
    await expect(page.getByRole("button", { name: "אני אוהבת חתולים." })).toBeVisible()
    await expect(page.getByText("שלום, מה תרצה להזמין?")).toHaveCount(0)
  })

  test("HUD toggle switches you-are-here gender on the map", async ({ page }) => {
    await gotoApp(page, "/map")
    await expect(page.getByText("אתה כאן")).toBeVisible()
    await page.getByTestId("hud-gender-female").click()
    await expect(page.getByText("את כאן")).toBeVisible()
  })
})
