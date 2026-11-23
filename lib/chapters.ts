import type { Mission, MissionChapter } from "@/lib/types"

export const CHAPTERS: {
  id: MissionChapter
  order: number
  titleHe: string
  titleEn: string
  blurbHe: string
  blurbEn: string
}[] = [
  {
    id: "landing",
    order: 1,
    titleHe: "נחיתה",
    titleEn: "Landing",
    blurbHe: "בן גוריון, דרכון, מונית. הימים הראשונים בלי אנגלית.",
    blurbEn: "Ben Gurion, a passport, a taxi. The first days with no English.",
  },
  {
    id: "papers",
    order: 2,
    titleHe: "ניירת",
    titleEn: "Papers",
    blurbHe: "בנק, קופת חולים, אולפן, רישיון. הבירוקרטיה שמחכה לכל עולה.",
    blurbEn: "Bank, health fund, ulpan, license. The bureaucracy every oleh meets.",
  },
  {
    id: "wheels",
    order: 3,
    titleHe: "מאחורי ההגה",
    titleEn: "Behind the wheel",
    blurbHe: "שש משימות, שמונה־עשר ביטויים. השכרה, דלק, חוף, חניה, משטרה, תאונה.",
    blurbEn: "Six missions, eighteen phrases. Rental, fuel, beach, parking, police, crash.",
  },
  {
    id: "daily",
    order: 4,
    titleHe: "חיים בארץ",
    titleEn: "Daily life",
    blurbHe: "קפה, שוק, סופר, אוטובוס. העברית של הקניות והרחוב.",
    blurbEn: "Cafe, market, supermarket, bus. The Hebrew of errands and the street.",
  },
  {
    id: "friends",
    order: 5,
    titleHe: "חברים בפארק",
    titleEn: "Friends in the park",
    blurbHe: "להצטרף לפיקניק, להחליף שמות, לקבוע לשישי. כאן מדברים כמו חברים.",
    blurbEn: "Join a picnic, swap names, make Friday plans. This is friend-register Hebrew.",
  },
]

export function chapterOf(mission: Mission): MissionChapter {
  return mission.chapter ?? "daily"
}

export function missionOrder(mission: Mission) {
  return mission.order ?? 80
}

export function missionsByChapter(missions: Mission[]) {
  return CHAPTERS.map((chapter) => ({
    ...chapter,
    missions: missions
      .filter((mission) => chapterOf(mission) === chapter.id)
      .slice()
      .sort((a, b) => missionOrder(a) - missionOrder(b)),
  })).filter((chapter) => chapter.missions.length > 0)
}

export function phraseCount(mission: Mission) {
  return mission.nodes.length
}
