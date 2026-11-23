import type { Mission } from "@/lib/types"

export const TEL_AVIV_EXTRA: Mission[] = [
  {
    id: "ta_transit_01",
    city: "tel-aviv",
    title: "שירות או קורקינט",
    englishTitle: "Sherut or scooter",
    difficulty: "Beginner",
    xpReward: 45,
    shekelReward: 25,
    minLevel: 1,
    setupHebrew: "צריך להגיע לרוטשילד. יש שירות, יש קורקינט, ואין אנגלית.",
    setupText: "You need to get to Rothschild. There is a sherut, a scooter, and no English.",
    nodes: [
      {
        id: "node_1",
        speaker: "בחורה בתחנה",
        hebrewText: {
          male: "אתה אבוד? כולם אבודים פה ביום הראשון.",
          female: "את אבודה? כולם אבודים פה ביום הראשון.",
        },
        englishTranslation: {
          male: "Are you (m.) lost? Everyone is lost here on day one.",
          female: "Are you (f.) lost? Everyone is lost here on day one.",
        },
        wordBank: {
          אתה: "you",
          אבוד: "lost",
          כולם: "everyone",
          אבודים: "lost (plural)",
          פה: "here",
          ביום: "on the day",
          הראשון: "the first",
        },
        options: [
          {
            text: "יש שירות לרוטשילד? כמה זה עולה?",
            englishTranslation: "Is there a sherut to Rothschild? How much is it?",
            isCorrect: true,
            nextNode: "node_2",
          },
          {
            text: "אני רוצה מונית לאילת",
            englishTranslation: "I want a taxi to Eilat",
            isCorrect: false,
            feedback: "To Eilat? You are in Tel Aviv. Breathe.",
          },
          {
            text: "Where is the bus?",
            englishTranslation: "Where is the bus?",
            isCorrect: false,
            feedback: "English will not get you to Rothschild today.",
          },
        ],
      },
      {
        id: "node_2",
        speaker: "נהג שירות",
        hebrewText: {
          male: "חמישה עשר. יש רב-קו או מזומן. תחליט מהר, אני נוסע.",
          female: "חמישה עשר. יש רב-קו או מזומן. תחליטי מהר, אני נוסע.",
        },
        englishTranslation: {
          male: "Fifteen. Rav-Kav or cash. Decide (m.) fast, I am leaving.",
          female: "Fifteen. Rav-Kav or cash. Decide (f.) fast, I am leaving.",
        },
        wordBank: {
          חמישה: "five",
          עשר: "ten (fifteen together)",
          יש: "there is",
          "רב-קו": "Rav-Kav",
          או: "or",
          מזומן: "cash",
          תחליט: "decide (m.)",
          תחליטי: "decide (f.)",
          מהר: "fast",
          אני: "I",
          נוסע: "am leaving / driving",
        },
        options: [
          {
            text: "רגע, יש לי רב-קו. איפה מעבירים?",
            englishTranslation: "Wait, I have a Rav-Kav. Where do I tap?",
            isCorrect: true,
            nextNode: "node_3",
          },
          {
            text: {
              male: "אני לא משלם, אני תייר",
              female: "אני לא משלמת, אני תיירת",
            },
            englishTranslation: {
              male: "I am not paying (m.), I am a tourist (m.)",
              female: "I am not paying (f.), I am a tourist (f.)",
            },
            isCorrect: false,
            feedback: "A tourist pays more, not less. Get off or pay.",
          },
          {
            text: "אפשר לשלם בדולרים?",
            englishTranslation: "Can I pay in dollars?",
            isCorrect: false,
            feedback: "Dollars? What is this, the airport? Shekels.",
          },
        ],
      },
      {
        id: "node_3",
        speaker: "אפליקציית הקורקינט",
        hebrewText: "רוצה קורקינט? צריך קסדה. מה עושים בסוף הנסיעה?",
        englishTranslation: "Want a scooter? You need a helmet. What do you do at the end of the ride?",
        wordBank: {
          רוצה: "want",
          קורקינט: "scooter",
          צריך: "need",
          קסדה: "helmet",
          מה: "what",
          עושים: "do (you do)",
          בסוף: "at the end",
          הנסיעה: "the ride",
        },
        options: [
          {
            text: "יש לי קסדה. איפה משאירים את הקורקינט?",
            englishTranslation: "I have a helmet. Where do I leave the scooter?",
            isCorrect: true,
            nextNode: "success",
          },
          {
            text: "אין לי קסדה, זה בסדר נכון?",
            englishTranslation: "I have no helmet, that's fine right?",
            isCorrect: false,
            feedback: "No helmet, no ride.",
          },
          {
            text: "אזרוק אותו ליד הים",
            englishTranslation: "I will dump it by the sea",
            isCorrect: false,
            feedback: "Dump it by the sea and you get a fine. Marked station only.",
          },
        ],
      },
    ],
  },
]
