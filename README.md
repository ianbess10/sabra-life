# סברה לייף · Sabra Life

A browser-based Hebrew immersion RPG. You are an *oleh chadash* (new immigrant) in Israel. Missions are in Hebrew. The UI is in Hebrew. English hints cost ₪50.

The loop is **mission → earn shekels and XP → buy a better life on Yad2**.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — only needed for cloud save
npm run dev
```

Open [http://localhost:3847](http://localhost:3847). Progress is always saved in the browser (`localStorage` key `sabra-life`). Sign in from the HUD to also back it up to Supabase.

## Cloud save (Supabase)

You run the SQL yourself in the Supabase dashboard. The app does not apply migrations.

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql), and run it. That creates `profiles` (including streak columns and `username`), `inventory`, row-level security, the signup trigger, and the `public_leaderboard` view.
3. Copy **Project URL** and the **anon** (or publishable) key from **Project Settings → API**.
4. Put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`), then restart the dev server.
5. Use **כניסה** in the HUD to sign in or register. The HUD shows **שומר…** / **נשמר** while progress syncs.

Without those keys the game stays fully playable offline. The HUD shows **רק במכשיר**. The leaderboard stays empty until the view exists.

Existing databases that already ran the older split scripts (`setup.sql`, `leaderboard.sql`, `streak.sql`) do not need to run the combined migration.

## Production (Vercel)

Live at [https://sabra-life.vercel.app](https://sabra-life.vercel.app). Follow [`DEPLOY.md`](DEPLOY.md) to add production Supabase keys, rebuild, and point Auth at that domain. Until those keys exist, the live game still works with local progress only.

Client helpers live at `utils/supabase/client.ts` and `utils/supabase/server.ts` (TypeScript equivalents of the usual `client.js` / `server.js` SSR pair).

## How to play

1. Start in Tel Aviv. Complete market, transit, and café missions.
2. Spend shekels on Yad2: Rav-Kav, scooter, apartment, phone, dining.
3. Hit Ulpan Bet (level 2) to unlock Jerusalem, Ulpan Dalet (level 4) for Raanana.
4. Travel between cities costs ₪15 on public transit unless you own a Mazda or Tesla. A scooter does not leave Tel Aviv.
5. Tap **רמז באנגלית** to reveal English for the current screen — it deducts ₪50.
6. A wrong mission answer costs ₪5. The right line advances the dialogue tree; finishing a tree pays `xpReward` and `shekelReward`.
7. Tap the speaker button next to a line to hear it in Hebrew (`he-IL`, slightly slow). Audio lives in `hooks/useHebrewTTS.js` so a later cloud TTS swap does not touch the mission UI.
8. Dashed words in a mission line cost ₪1 each and show an English gloss. The ₪50 hint still translates the whole screen.

## End-to-end tests

Playwright covers auth, missions, Yad2, word hints, TTS, and daily streaks. Tests run against Chromium on `http://localhost:3000` and intercept `https://sabra-e2e.supabase.co` so they never write to a real project.

```bash
npx playwright install --with-deps
npm run test:e2e
```

The suite starts its own Next.js server on port 3000 with the mock keys in `.env.test`. It does not use the `npm run dev` server on 3847.

## Stack

Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, Lucide, Supabase Auth + Postgres (optional).
