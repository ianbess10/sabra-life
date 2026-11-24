export const TRAILER_DURATION = 20

export type TrailerKind = "parking" | "ramzor"

const PARKING_BEATS = [
  { at: 0, he: "רחוב הירקון. שקיעה.", en: "Hayarkon Street. Dusk." },
  { at: 4, he: "אין חניה.", en: "No parking." },
  { at: 8.2, he: "רק המדרכה נשארה.", en: "Only the sidewalk is left." },
  { at: 12.6, he: "על המדרכה? דו״ח.", en: "On the sidewalk? A ticket." },
  { at: 16.4, he: "חניה בהירקון · בעברית.", en: "Parking on Hayarkon · in Hebrew." },
] as const

const RAMZOR_BEATS = [
  { at: 0, he: "רחוב הירקון. רמזור.", en: "Hayarkon Street. A traffic light." },
  { at: 4, he: "אדום. עוצרים.", en: "Red. You stop." },
  { at: 8.2, he: "מי שרץ…", en: "Whoever runs it…" },
  { at: 12.6, he: "ברמזור אדום? דו״ח.", en: "Red light? A ticket." },
  { at: 16.4, he: "רמזור בהירקון · בעברית.", en: "The light on Hayarkon · in Hebrew." },
] as const

export const TRAILER_BEATS = RAMZOR_BEATS

export function trailerCaption(time: number, kind: TrailerKind = "ramzor") {
  const beats = kind === "parking" ? PARKING_BEATS : RAMZOR_BEATS
  let current: (typeof beats)[number] = beats[0]
  for (const beat of beats) {
    if (time >= beat.at) current = beat
  }
  return current
}

export function trailerProgress(time: number, kind: TrailerKind = "ramzor") {
  const t = Math.max(0, Math.min(TRAILER_DURATION, time))
  const u = t / TRAILER_DURATION
  if (kind === "parking") {
    const drive = Math.min(1, t / 8)
    const veer = t < 8 ? 0 : Math.min(1, (t - 8) / 4.4)
    const fail = t >= 12.6
    return { t, u, drive, veer, run: 0, fail }
  }
  const drive = Math.min(1, t / 12.6)
  const run = t < 12.6 ? 0 : Math.min(1, (t - 12.6) / 5)
  const fail = t >= 12.6
  return { t, u, drive, veer: 0, run, fail }
}
