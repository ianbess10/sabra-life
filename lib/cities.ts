import type { CitySlug, HintLine } from "@/lib/types"

export type CityInfo = {
  slug: CitySlug
  nameHe: string
  nameEn: string
  vibeHe: string
  vibeEn: string
  levelLabelHe: string
  levelLabelEn: string
  accent: string
}

export const CITIES: CityInfo[] = [
  {
    slug: "tel-aviv",
    nameHe: "תל אביב",
    nameEn: "Tel Aviv",
    vibeHe: "חוף, סטארט־אפים, ושוק שצועק עליך בעברית.",
    vibeEn: "Beach, startups, and a market that shouts at you in Hebrew.",
    levelLabelHe: "אולפן א׳ · מתחילים",
    levelLabelEn: "Ulpan Aleph · Beginner",
    accent: "from-teal-500/30 to-orange-400/20",
  },
  {
    slug: "jerusalem",
    nameHe: "ירושלים",
    nameEn: "Jerusalem",
    vibeHe: "אבן, תור במשרד הפנים, וסמטאות שמתפתלות.",
    vibeEn: "Stone, Interior Ministry queues, and winding alleys.",
    levelLabelHe: "אולפן ב׳–ג׳ · בינוני",
    levelLabelEn: "Ulpan Bet–Gimel · Intermediate",
    accent: "from-amber-200/25 to-stone-500/20",
  },
  {
    slug: "raanana",
    nameHe: "רעננה",
    nameEn: "Raanana",
    vibeHe: "פרברים, משכנתא, ופגישות דירקטוריון בלי אנגלית.",
    vibeEn: "Suburbia, mortgages, and boardrooms with no English.",
    levelLabelHe: "אולפן ד׳–ה׳ · מתקדמים",
    levelLabelEn: "Ulpan Dalet–Hey · Advanced",
    accent: "from-emerald-400/25 to-lime-200/10",
  },
]

export function getCity(slug: string) {
  return CITIES.find((city) => city.slug === slug)
}

export function cityHintLines(city: CityInfo): HintLine[] {
  return [
    { he: city.nameHe, en: city.nameEn },
    { he: city.levelLabelHe, en: city.levelLabelEn },
    { he: city.vibeHe, en: city.vibeEn },
  ]
}
