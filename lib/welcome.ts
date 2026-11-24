export type WelcomeSection = {
  title: string
  body?: string
  items?: string[]
}

export const WELCOME = {
  kicker: "Beta",
  title: "Welcome to Sabra Life",
  subtitle: "Your New Immigrant Survival Simulator",
  intro:
    "This isn't a flashcard app. You are an oleh chadash landing in Tel Aviv with ₪200 in עו״ש and no address. Missions, the map, and Yad2 are in Hebrew. English costs shekels.",
  sections: [
    {
      title: "Your profile",
      body: "Choose man or woman before you land. Hebrew marks gender on almost every verb: אתה/את, צריך/צריכה, משלם/משלמת. Switch any time in the HUD.",
    },
    {
      title: "The HUD",
      items: [
        "רמה (level / XP) decides which cities and missions you can reach. Jerusalem opens at Ulpan Bet (level 2). Raanana opens at Ulpan Dalet (level 4).",
        "עו״ש is your bank balance. Every wrong mission answer costs ₪5. Think before you click.",
        "The flame is your daily streak. Finish a mission each calendar day to grow it and earn bonus shekels.",
      ],
    },
    {
      title: "The street",
      body: "Third person, like GTA. WASD or the stick to walk the street. Maggie, your black Scottish Terrier, heels at your side — מגי on the HUD and a dark blip on the radar. E talks in Hebrew without leaving the world. F gets in a Yad2 vehicle, or a taxi at נתב״ג; Maggie hops in too. P opens the phone. The taxi ride to Rothschild is a real drive — the driver keeps talking while you steer. Bump people and wanted stars come out.",
    },
    {
      title: "The Oleh Test",
      body: "Seventeen missions from Ben Gurion to a picnic in the park. The six driving scenes copy the Hebrew №1 trainer: rent a car, fill 95, ask for the beach, pay blue-and-white parking, survive a speed trap, exchange insurance details. Eighteen phrases on the road. No English behind the wheel.",
    },
    {
      title: "Missions",
      body: "Land, papers, wheels, daily life, friends. Read the scene, hear the line, pick the Hebrew reply. The right path pays XP and shekels. Replay is practice: no second payout.",
    },
    {
      title: "Hints and audio",
      items: [
        "The speaker next to a line reads it in Hebrew.",
        "Dashed words cost ₪1 each for an English gloss. Spend them like cash.",
        "רמז באנגלית costs ₪50 and translates the whole current screen.",
      ],
    },
    {
      title: "Yad2",
      body: "A hostel bed is the first roof you can buy. Then a shared flat, then a real apartment. A Rav-Kav (₪80) or scooter gets you around Tel Aviv; a scooter does not leave the city. A Mazda or Tesla makes intercity travel free.",
    },
    {
      title: "Leaderboard",
      body: "The trophy compares XP (language) and shekels (tycoon) once you sign in. Without an account, progress stays on this device.",
    },
    {
      title: "Beta testers",
      body: "Tell the developer what broke the fantasy.",
      items: [
        "Difficulty — are missions too hard, or too easy?",
        "Audio — is the Hebrew text-to-speech clear?",
        "Economy — do you earn enough, or is Yad2 too expensive?",
        "Bugs — freeze, unfair streak reset, anything that felt wrong.",
      ],
    },
  ] satisfies WelcomeSection[],
} as const
