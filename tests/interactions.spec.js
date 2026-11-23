import { expect, test } from "@playwright/test"

import {
  CAFE_ANSWERS,
  WORD_HINT_COST,
  gotoApp,
  hudShekels,
  openCafeMission,
} from "./helpers/app.js"

test.describe("Suite 4: Micro-Hints & Text-to-Speech", () => {
  test("Test A: TTS speaker calls speechSynthesis.speak with Hebrew he-IL", async ({
    page,
  }) => {
    await gotoApp(page, "/")
    await openCafeMission(page)

    await page.getByTestId("mission-tts").click()

    await expect
      .poll(() => page.evaluate(() => (window.__speakCalls ?? []).length), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0)

    const call = await page.evaluate(() => window.__speakCalls[0])
    expect(call.text).toBe(CAFE_ANSWERS.node1Prompt)
    expect(call.lang).toBe("he-IL")
  })

  test("Test B: Clicking שלום shows Hello and deducts ₪1", async ({ page }) => {
    await gotoApp(page, "/")
    const before = await hudShekels(page)
    await openCafeMission(page)

    await page.getByTestId("word-שלום").click()

    const tooltip = page.getByTestId("word-hint-tooltip")
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toHaveText(/hello/i)
    await expect.poll(() => hudShekels(page)).toBe(before - WORD_HINT_COST)
  })
})
