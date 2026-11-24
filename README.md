# סברה לייף · Sabra Life

The oleh chadash test. You land at Ben Gurion with ₪200, pick a Hebrew gender profile, and talk your way through Israel. Missions are in Hebrew. The UI is in Hebrew. English costs shekels.

The loop is **walk the street → talk to someone → earn shekels and XP → buy a better life on Yad2**.

You land at Ben Gurion as a third-person character. WASD (or the stick on a phone) to walk. **E** talks to whoever is in front of you — at the café that is a door: you walk inside, then order at the counter. **F** gets in a Yad2 vehicle or the airport taxi; on Hayarkon it is also how you park (blue-and-white) or fail (red-and-white / sidewalk / a red **רמזור**). **P** opens the phone. Maggie heels at your side. The taxi to Rothschild is a real drive.

## The Oleh Test

Seventeen missions in Tel Aviv, in order:

1. **Landing** — passport control, taxi from the airport
2. **Papers** — bank account, kupat holim, ulpan, license conversion
3. **Behind the wheel** — six scenes, eighteen phrases, modeled on the Hebrew №1 driving trainer: rent a car, fill 95, ask for the beach, pay blue-and-white parking, a speed trap, an accident
4. **Daily life** — café, shuk, supermarket, bus
5. **Friends** — a picnic in the park

Jerusalem and Raanana open later, once your level says you can leave Tel Aviv.

## Gender

Hebrew marks gender on almost every verb. Choose **גבר** or **אישה** in the first-run briefing (or later in the HUD). NPCs switch `אתה/את`, `צריך/צריכה`, `משלם/משלמת` to match. Default is male.

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

Existing databases that already ran the older split scripts (`setup.sql`, `leaderboard.sql`, `streak.sql`) do not need to run the combined migration. Gender stays on the device; it is not a cloud column yet.

## Production (Vercel)

Live at [https://sabra-life.vercel.app](https://sabra-life.vercel.app). Source is [github.com/ianbess10/sabra-life](https://github.com/ianbess10/sabra-life). Push-to-deploy currently rebuilds [https://sabra-life-git.vercel.app](https://sabra-life-git.vercel.app); see [`DEPLOY.md`](DEPLOY.md) to attach Git to the public URL, add production Supabase keys, and point Auth at the live domain. Until those keys exist, the live game still works with local progress only.

Client helpers live at `utils/supabase/client.ts` and `utils/supabase/server.ts`.

## How to play

The first visit opens a beta briefing that asks for your gender profile. Reopen it anytime from **מדריך** in the HUD.

1. You spawn at Ben Gurion in third person. Walk up to passport control. Open the phone (P) to pick any mission from the oleh test.
2. Talking happens in the street: a spoken Hebrew line, reply chips, phrase `n/N`, the city still behind you. After the taxi fare, you drive toward Rothschild.
3. Spend shekels on Yad2: Rav-Kav, scooter, apartment, phone, dining.
4. Hit Ulpan Bet (level 2) to unlock Jerusalem, Ulpan Dalet (level 4) for Raanana.
5. Travel between cities costs ₪15 on public transit unless you own a Mazda or Tesla. A scooter does not leave Tel Aviv.
6. Tap **רמז באנגלית** to reveal English for the current screen — it deducts ₪50.
7. A wrong mission answer costs ₪5. The right line advances the dialogue tree; finishing a tree pays `xpReward` and `shekelReward`.
8. Hebrew audio is on demand: tap the speaker on a line. Nothing auto-plays when you land.
9. Dashed words cost ₪1 each and show an English gloss.

## End-to-end tests

Playwright covers auth, missions, Yad2, word hints, TTS, daily streaks, gender, the driving replica, and the welcome briefing. Tests run against Chromium on `http://localhost:3000` and intercept `https://sabra-e2e.supabase.co` so they never write to a real project.

```bash
npx playwright install --with-deps
npm run test:e2e
```

The suite starts its own Next.js server on port 3000 with the mock keys in `.env.test`. It does not use the `npm run dev` server on 3847. Default gender is male so the café mission still expects `מה תרצה להזמין?`.

## Stack

Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, Lucide, Supabase Auth + Postgres (optional).
