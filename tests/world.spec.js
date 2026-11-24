import { expect, test } from "@playwright/test"

import { CAFE_ANSWERS, gotoApp, setGameState } from "./helpers/app.js"

test.describe("GTA streets", () => {
  test("spawns in the city with a radar, phone, and a walkable character", async ({
    page,
  }) => {
    await gotoApp(page, "/")
    await expect(page.getByTestId("gta-world")).toBeVisible()
    await expect(page.getByTestId("gta-canvas")).toBeVisible()
    await expect(page.getByTestId("gta-player")).toBeVisible()
    await expect(page.getByTestId("gta-maggie")).toHaveText("מגי")
    await expect(page.getByTestId("gta-radar")).toBeVisible()
    await expect(page.getByTestId("gta-maggie-blip")).toBeVisible()
    await expect(page.getByTestId("gta-phone")).toBeVisible()
  })

  test("walking up to the airport NPC starts the oleh landing mission", async ({
    page,
  }) => {
    await gotoApp(page, "/")
    await expect(page.getByTestId("world-interact-desktop")).toBeVisible({ timeout: 8_000 })
    await page.keyboard.press("e")
    await expect(page.getByText("שלום, דרכון בבקשה. עלייה?")).toBeVisible()
  })

  test("Hayarkon parking is a Hebrew lesson, not a trailer", async ({ page }) => {
    await gotoApp(page, "/")
    await expect(page.getByTestId("parking-trailer")).toHaveCount(0)
    await page.getByTestId("gta-phone").click()
    await page
      .getByTestId("mission-ta_parking")
      .getByRole("button", { name: /התחל משימה|תרגול/ })
      .click()
    await expect(page.getByText("חושבים שווייס סיטי קשוחה? פה רחוב הירקון. כחול־לבן, צריך לשלם.")).toBeVisible()
    await expect(page.getByRole("button", { name: "אני משלם עכשיו בפנגו." })).toBeVisible()
  })

  test("phone still starts the cafe mission", async ({ page }) => {
    await gotoApp(page, "/")
    await page.getByTestId("gta-phone").click()
    await expect(page.getByTestId("gta-phone-panel")).toBeVisible()
    await page
      .getByTestId("mission-ta_cafe_01")
      .getByRole("button", { name: /התחל משימה|תרגול/ })
      .click()
    await expect(page.getByTestId("gta-player")).toContainText("בקפה")
    await expect(page.getByText(CAFE_ANSWERS.node1Prompt)).toBeVisible()
  })

  test("the ramzor trailer is the same dusk city, skippable", async ({ page }) => {
    await gotoApp(page, "/")
    await page.getByTestId("parking-trailer-button").click()
    await expect(page.getByTestId("parking-trailer")).toBeVisible()
    await expect(page.getByTestId("parking-trailer-caption")).toHaveText("רחוב הירקון. רמזור.")
    await expect(page.getByTestId("parking-trailer")).toHaveAttribute("data-trailer-kind", "ramzor")
    await page.getByTestId("parking-trailer-skip").click()
    await expect(page.getByTestId("parking-trailer")).toHaveCount(0)
  })

  test("sidewalk parking on Hayarkon is a Hebrew ticket", async ({ page }) => {
    await gotoApp(page, "/")
    await setGameState(page, {
      inventory: { vehicle: "mazda", property: null, phone: "basic", dining: "street" },
      inVehicle: true,
      worldX: 228,
      worldY: 400,
    })
    await expect(page.getByTestId("gta-player")).toContainText("מאזדה")
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.keyboard.press("f")
    await expect(page.getByText(/על המדרכה\? דו״ח/)).toBeVisible()
  })

  test("running a red ramzor on Hayarkon is a Hebrew ticket", async ({ page }) => {
    await gotoApp(page, "/")
    await setGameState(page, {
      inventory: { vehicle: "mazda", property: null, phone: "basic", dining: "street" },
      inVehicle: true,
      worldX: 285,
      worldY: 845,
    })
    await expect(page.getByTestId("gta-player")).toContainText("מאזדה")
    await page.evaluate(() => {
      window.__SABRA_FORCE_RAMZOR__ = "red"
    })
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.keyboard.down("w")
    await expect(page.getByText(/ברמזור אדום\? דו״ח/)).toBeVisible()
    await page.keyboard.up("w")
  })
})
