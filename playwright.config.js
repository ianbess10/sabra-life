// @ts-check
import { defineConfig, devices } from "@playwright/test"

const E2E_SUPABASE_URL = "https://sabra-e2e.supabase.co"
const E2E_SUPABASE_ANON_KEY =
  "eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYW5vbiIsImlzcyI6InNhYnJhLWUyZSJ9.e2e"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 45_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "he-IL",
    timezoneId: "Africa/Johannesburg",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_SUPABASE_URL: E2E_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: E2E_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: E2E_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_E2E: "1",
    },
  },
})
