import { expect, test } from "@playwright/test"

import { CAFE_ANSWERS, gotoApp } from "./helpers/app.js"

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

  test("dusk sting sells GTA Tel Aviv, then Hayarkon parking is a Hebrew lesson", async ({
    page,
  }) => {
    await gotoApp(page, "/")
    await expect(page.getByTestId("dusk-sting-title")).toHaveText("GTA תל אביב")
    await expect(page.getByTestId("dusk-sting")).toContainText("חניה ברחוב הירקון")
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
    await expect(page.getByText(CAFE_ANSWERS.node1Prompt)).toBeVisible()
  })
})
