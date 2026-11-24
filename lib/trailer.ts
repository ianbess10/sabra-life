export const TRAILER_DURATION = 20

export const TRAILER_BEATS = [
  { at: 0, he: "רחוב הירקון. שקיעה.", en: "Hayarkon Street. Dusk." },
  { at: 4, he: "אין חניה.", en: "No parking." },
  { at: 8.2, he: "רק המדרכה נשארה.", en: "Only the sidewalk is left." },
  { at: 12.6, he: "על המדרכה? דו״ח.", en: "On the sidewalk? A ticket." },
  { at: 16.4, he: "חניה בהירקון · בעברית.", en: "Parking on Hayarkon · in Hebrew." },
] as const

export function trailerCaption(time: number) {
  let current: (typeof TRAILER_BEATS)[number] = TRAILER_BEATS[0]
  for (const beat of TRAILER_BEATS) {
    if (time >= beat.at) current = beat
  }
  return current
}

export function trailerProgress(time: number) {
  const t = Math.max(0, Math.min(TRAILER_DURATION, time))
  const u = t / TRAILER_DURATION
  const drive = Math.min(1, t / 8)
  const veer = t < 8 ? 0 : Math.min(1, (t - 8) / 4.4)
  const fail = t >= 12.6
  return { t, u, drive, veer, fail }
}
