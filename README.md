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
2. Open **SQL Editor**, paste [`supabase/setup.sql`](supabase/setup.sql), and run it. That creates `profiles` and `inventory`, row-level security, and an auth trigger that inserts both rows when a user signs up.
3. Copy **Project URL** and the **publishable** (or legacy **anon**) key from **Project Settings → API**.
4. Put them in `.env.local` using the names in `.env.example`, then restart the dev server.
5. Use **כניסה** in the HUD to sign in or register. The HUD shows **שומר…** / **נשמר** while progress syncs.

Without those keys the game stays fully playable offline. The HUD shows **רק במכשיר**.

Client helpers live at `utils/supabase/client.ts` and `utils/supabase/server.ts` (TypeScript equivalents of the usual `client.js` / `server.js` SSR pair).

## How to play

1. Start in Tel Aviv. Complete market, transit, and café missions.
2. Spend shekels on Yad2: Rav-Kav, scooter, apartment, phone, dining.
3. Hit Ulpan Bet (level 2) to unlock Jerusalem, Ulpan Dalet (level 4) for Raanana.
4. Travel between cities costs ₪15 on public transit unless you own a Mazda or Tesla. A scooter does not leave Tel Aviv.
5. Tap **רמז באנגלית** to reveal English for the current screen — it deducts ₪50.
6. A wrong mission answer costs ₪5. The right line advances the dialogue tree; finishing a tree pays `xpReward` and `shekelReward`.

## Stack

Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, Lucide, Supabase Auth + Postgres (optional).
