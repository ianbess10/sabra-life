import type { MissionScript } from "@/lib/types"

export const telAvivMissions: MissionScript[] = [
  {
    id: "ta_cafe_01",
    title: "בית קפה ברוטשילד",
    englishTitle: "Rothschild Cafe",
    difficulty: "Beginner",
    xpReward: 50,
    shekelReward: 20,
    setupText: "You sit at a trendy cafe on Rothschild Boulevard. The waiter approaches you.",
    nodes: [
      {
        id: "node_1",
        speaker: "מלצר (Waiter)",
        hebrewText: "שלום, מה תרצה להזמין?",
        englishTranslation: "Hello, what would you like to order?",
        options: [
          {
            text: "אני רוצה קפה הפוך בבקשה.",
            englishTranslation: "I want a cappuccino, please.",
            isCorrect: true,
            nextNode: "node_2",
          },
          {
            text: "אני אוהב חתולים.",
            englishTranslation: "I like cats.",
            isCorrect: false,
            feedback: "The waiter looks confused. Try again.",
          },
          {
            text: "כמה זה עולה?",
            englishTranslation: "How much does it cost?",
            isCorrect: false,
            feedback: "You haven't ordered anything yet!",
          },
        ],
      },
      {
        id: "node_2",
        speaker: "מלצר (Waiter)",
        hebrewText: "איזה גודל? קטן או גדול?",
        englishTranslation: "What size? Small or large?",
        options: [
          {
            text: "גדול בבקשה, עם חלב שיבולת שועל.",
            englishTranslation: "Large please, with oat milk.",
            isCorrect: true,
            nextNode: "node_3",
          },
          {
            text: "אני רוצה מים.",
            englishTranslation: "I want water.",
            isCorrect: false,
            feedback: "You just ordered a coffee, don't change your mind now!",
          },
        ],
      },
      {
        id: "node_3",
        speaker: "מלצר (Waiter)",
        hebrewText: "מצוין. זה יוצא עשרים שקלים. באשראי או במזומן?",
        englishTranslation: "Excellent. That comes to twenty shekels. Credit or cash?",
        options: [
          {
            text: "באשראי, בבקשה.",
            englishTranslation: "By credit, please.",
            isCorrect: true,
            nextNode: "success",
          },
          {
            text: "אני לא משלם.",
            englishTranslation: "I am not paying.",
            isCorrect: false,
            feedback: "Security is being called. Pay the waiter.",
          },
        ],
      },
    ],
  },
  {
    id: "ta_shuk_01",
    title: "קניות בשוק הכרמל",
    englishTitle: "Shopping at Carmel Market",
    difficulty: "Beginner",
    xpReward: 75,
    shekelReward: 30,
    setupText: "You are standing in front of a loud, busy vegetable stand in the middle of Shuk HaCarmel.",
    nodes: [
      {
        id: "node_1",
        speaker: "מוכר (Vendor)",
        hebrewText: "עגבניות הכי טובות בשוק! רק עשרה שקלים לקילו! בוא, אחי!",
        englishTranslation: "Best tomatoes in the market! Only ten shekels a kilo! Come, brother!",
        options: [
          {
            text: "איפה הים?",
            englishTranslation: "Where is the sea?",
            isCorrect: false,
            feedback: "The vendor ignores you and yells at another customer.",
          },
          {
            text: "תן לי שני קילו בבקשה.",
            englishTranslation: "Give me two kilos, please.",
            isCorrect: true,
            nextNode: "node_2",
          },
          {
            text: "אני לא מדבר עברית.",
            englishTranslation: "I don't speak Hebrew.",
            isCorrect: false,
            feedback:
              "The vendor switches to broken English and charges you double (Tourist Tax!). Use Hebrew.",
          },
        ],
      },
      {
        id: "node_2",
        speaker: "מוכר (Vendor)",
        hebrewText: "בבקשה. תרצה גם מלפפונים? יש מבצע היום.",
        englishTranslation: "Here you go. Would you like cucumbers too? There is a sale today.",
        options: [
          {
            text: "לא, רק עגבניות. קח מזומן.",
            englishTranslation: "No, only tomatoes. Take cash.",
            isCorrect: true,
            nextNode: "success",
          },
          {
            text: "כן, חצי קילו בבקשה.",
            englishTranslation: "Yes, half a kilo please.",
            isCorrect: true,
            nextNode: "success",
          },
          {
            text: "מה השעה?",
            englishTranslation: "What time is it?",
            isCorrect: false,
            feedback: "He's trying to sell you vegetables, not give you the time.",
          },
        ],
      },
    ],
  },
]
