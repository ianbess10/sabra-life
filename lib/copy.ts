import type { HintLine } from "@/lib/types"

export const UI = {
  appName: { he: "סברה לייף", en: "Sabra Life" },
  tagline: {
    he: "עולה חדש. ישראל. בלי אנגלית בחינם.",
    en: "New immigrant. Israel. No free English.",
  },
  navHome: { he: "בית", en: "Home" },
  navMap: { he: "מפה", en: "Map" },
  navYad2: { he: "יד2", en: "Yad2" },
  hint: { he: "רמז באנגלית", en: "English hint" },
  hintCost: { he: "₪50", en: "₪50" },
  noMoney: { he: "אין מספיק כסף", en: "Not enough money" },
  level: { he: "רמה", en: "Level" },
  bank: { he: "עו״ש", en: "Checking" },
  location: { he: "מיקום", en: "Location" },
  vehicle: { he: "רכב", en: "Vehicle" },
  property: { he: "דירה", en: "Home" },
  onFoot: { he: "ברגל", en: "On foot" },
  noHome: { he: "בלי כתובת", en: "No address" },
  loading: { he: "טוען את החיים החדשים…", en: "Loading your new life…" },
  nextMission: { he: "המשימה הבאה", en: "Next mission" },
  allDoneCity: {
    he: "סיימת את המשימות בעיר הזאת. אפשר לחזור לתרגול, או לנסוע הלאה.",
    en: "You finished this city's missions. Replay for practice, or travel on.",
  },
  travel: { he: "נסיעה", en: "Travel" },
  enterCity: { he: "כניסה לעיר", en: "Enter city" },
  locked: { he: "נעול", en: "Locked" },
  youAreHere: { he: "אתה כאן", en: "You are here" },
  fare: { he: "נסיעה בתחבורה ציבורית", en: "Public transit fare" },
  confirmTravel: { he: "לאשר נסיעה", en: "Confirm travel" },
  cancel: { he: "ביטול", en: "Cancel" },
  buy: { he: "קנייה", en: "Buy" },
  owned: { he: "ברשותך", en: "Owned" },
  tooPoor: { he: "חסר לך כסף", en: "You cannot afford this" },
  lowerTier: { he: "כבר יש לך משהו טוב יותר", en: "You already own something better" },
  starter: { he: "יש לך כבר", en: "Already yours" },
  continue: { he: "המשך", en: "Continue" },
  confirm: { he: "אישור", en: "Confirm" },
  close: { he: "סגור", en: "Close" },
  startMission: { he: "התחל משימה", en: "Start mission" },
  practice: { he: "תרגול", en: "Practice" },
  completed: { he: "הושלם", en: "Done" },
  reward: { he: "פרס", en: "Reward" },
  missionComplete: { he: "המשימה הושלמה", en: "Mission complete" },
  practiceDone: {
    he: "תרגול טוב. אין תשלום שני — כבר קיבלת את הפרס.",
    en: "Good practice. No second payout — you already collected.",
  },
  wrong: { he: "לא בדיוק", en: "Not quite" },
  typeAnswer: { he: "כתבו בעברית", en: "Type in Hebrew" },
  reset: { he: "התחל מחדש", en: "Start over" },
  resetConfirm: {
    he: "למחוק את כל ההתקדמות? אין חרטות, וגם אין דרכון שני.",
    en: "Delete all progress? No take-backs, and no second passport.",
  },
  missions: { he: "משימות", en: "Missions" },
  shopTransport: { he: "תחבורה", en: "Transport" },
  shopHomes: { he: "נדל״ן", en: "Real estate" },
  shopStatus: { he: "סטטוס", en: "Status" },
  welcomeTitle: { he: "ברוך הבא לארץ", en: "Welcome to the country" },
  welcomeBody: {
    he: "אתה עולה חדש. כדי לשרוד, להרוויח שקלים ולשדרג את החיים — צריך לדבר עברית. רמז באנגלית עולה כסף אמיתי במשחק.",
    en: "You are a new immigrant. To survive, earn shekels, and upgrade your life, you have to speak Hebrew. English hints cost in-game money.",
  },
  inventoryTitle: { he: "הרכוש שלך", en: "Your stuff" },
  emptyMissions: { he: "אין משימות זמינות ברמה הנוכחית.", en: "No missions at your current level." },
} as const

export function asHint(entry: { he: string; en: string }): HintLine {
  return { he: entry.he, en: entry.en }
}

export const HUD_HINTS: HintLine[] = [
  asHint(UI.navHome),
  asHint(UI.navMap),
  asHint(UI.navYad2),
  asHint(UI.hint),
  asHint(UI.level),
  asHint(UI.bank),
  asHint(UI.location),
]
