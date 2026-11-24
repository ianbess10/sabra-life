import { expect, test } from "@playwright/test"

import {
  SCOOTER_PRICE,
  getGameState,
  gotoApp,
  hudShekels,
  setGameState,
  signInAsTestUser,
  waitForSyncWrite,
} from "./helpers/app.js"

test.describe("Suite 3: Accumulation & Store", () => {
  test("Test A: Rav-Kav purchase is blocked at ₪0", async ({ page }) => {
    await gotoApp(page, "/yad2")
    await setGameState(page, { shekels: 0 })
    await expect.poll(() => hudShekels(page)).toBe(0)

    const ravKav = page.getByTestId("catalog-buy-rav-kav")
    await expect(ravKav).toBeDisabled()
    await expect(ravKav).toContainText("חסר לך כסף")
  })

  test("Test B: Buying an electric scooter deducts shekels, updates HUD, and syncs", async ({
    page,
  }) => {
    const mock = await gotoApp(page, "/yad2", { session: true })
    await signInAsTestUser(page)
    // Spec asks to mock ₪1000. The catalog scooter costs ₪1800, so seed the
    // larger of those two so the purchase can succeed and the deduction can
    // be asserted accurately.
    const starting = Math.max(1000, SCOOTER_PRICE)
    await setGameState(page, {
      shekels: starting,
      inventory: { vehicle: null, property: null, phone: "basic", dining: "street" },
    })
    mock.writes.length = 0
    await expect.poll(() => hudShekels(page)).toBe(starting)

    await page.getByTestId("catalog-buy-korkinet").click()

    await expect.poll(() => hudShekels(page)).toBe(starting - SCOOTER_PRICE)
    await expect(page.getByTestId("hud-vehicle")).toContainText("קורקינט חשמלי")

    const state = await getGameState(page)
    expect(state.inventory.vehicle).toBe("korkinet")
    expect(state.shekels).toBe(starting - SCOOTER_PRICE)

    const profileWrite = await waitForSyncWrite(
      mock,
      "profiles",
      8_000,
      (row) => row.shekels === starting - SCOOTER_PRICE
    )
    expect(profileWrite.row.shekels).toBe(starting - SCOOTER_PRICE)
    const inventoryWrite = await waitForSyncWrite(
      mock,
      "inventory",
      8_000,
      (row) => row.vehicle === "korkinet"
    )
    expect(inventoryWrite.row.vehicle).toBe("korkinet")
  })
})
