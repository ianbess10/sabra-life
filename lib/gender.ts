export type Gender = "male" | "female"

export type GenderedText = string | { male: string; female: string }

export const GENDERS: { id: Gender; he: string; en: string; sampleHe: string; sampleEn: string }[] =
  [
    {
      id: "male",
      he: "גבר",
      en: "Man",
      sampleHe: "אתה צריך רישיון ותעודת זהות.",
      sampleEn: "You (m.) need a license and an ID card.",
    },
    {
      id: "female",
      he: "אישה",
      en: "Woman",
      sampleHe: "את צריכה רישיון ותעודת זהות.",
      sampleEn: "You (f.) need a license and an ID card.",
    },
  ]

export function g(text: GenderedText | undefined, gender: Gender): string {
  if (text == null) return ""
  if (typeof text === "string") return text
  return text[gender]
}

export function genderedCopy(gender: Gender) {
  const female = gender === "female"
  return {
    welcomeTitle: female ? "ברוכה הבאה לארץ" : "ברוך הבא לארץ",
    welcomeTitleEn: female ? "Welcome (f.) to the country" : "Welcome (m.) to the country",
    youAreHere: female ? "את כאן" : "אתה כאן",
    you: female ? "את" : "אתה",
    youEn: female ? "You (f.)" : "You (m.)",
    anonymous: female ? "עולה חדשה" : "עולה חדש",
    olehTest: female ? "מבחן העולה" : "מבחן העולה",
    lost: female ? "את אבודה?" : "אתה אבוד?",
    pay: female ? "אני לא משלמת" : "אני לא משלם",
  }
}
