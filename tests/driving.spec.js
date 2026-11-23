import { expect, test } from "@playwright/test"

import { gotoApp } from "./helpers/app.js"

test.describe("Oleh driving trainer replica", () => {
  test("rent-a-car opens the cinematic overlay with phrase 1/3", async ({ page }) => {
    await gotoApp(page, "/")
    await page
      .getByTestId("mission-ta_rent_car")
      .getByRole("button", { name: /התחל משימה|תרגול/ })
      .click()

    await expect(page.getByText("שלום, לכמה ימים אתה צריך רכב?")).toBeVisible()
    await expect(page.getByText("ביטוי 1/3")).toBeVisible()
    await page
      .getByRole("button", { name: "אני רוצה לשכור רכב ליומיים עם ביטוח מלא." })
      .click()
    await expect(page.getByText("מצוין. הנה המפתח.")).toBeVisible()
    await expect(page.getByText("ביטוי 2/3")).toBeVisible()
  })
})
