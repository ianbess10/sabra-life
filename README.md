# סברה לייף · Sabra Life

A browser-based Hebrew immersion RPG. You are an *oleh chadash* (new immigrant) in Israel. Missions are in Hebrew. The UI is in Hebrew. English hints cost ₪50.

The loop is **mission → earn shekels and XP → buy a better life on Yad2**.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3847](http://localhost:3847). Progress is saved in the browser (`localStorage` key `sabra-life`).

## How to play

1. Start in Tel Aviv. Complete market, transit, and café missions.
2. Spend shekels on Yad2: Rav-Kav, scooter, apartment, phone, dining.
3. Hit Ulpan Bet (level 2) to unlock Jerusalem, Ulpan Dalet (level 4) for Raanana.
4. Travel between cities costs ₪15 on public transit unless you own a Mazda or Tesla. A scooter does not leave Tel Aviv.
5. Tap **רמז באנגלית** to reveal English for the current screen — it deducts ₪50.
6. A wrong mission answer costs ₪5. The right line advances the dialogue tree; finishing a tree pays `xpReward` and `shekelReward`.

## Stack

Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, Lucide. No backend.
