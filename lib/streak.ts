export const STREAK_BONUS_SHEKELS = 10

export type StreakResult = {
  streak: number
  bonus: boolean
  lastMissionDate: string
}

/** Local calendar key YYYY-MM-DD — never UTC from toISOString(). */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseLocalDateKey(value: string | Date | null | undefined): string | null {
  if (value == null || value === "") return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return localDateKey(value)
  }

  const raw = String(value).trim()
  const isoDay = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoDay) {
    const year = Number(isoDay[1])
    const month = Number(isoDay[2])
    const day = Number(isoDay[3])
    const local = new Date(year, month - 1, day)
    if (
      Number.isNaN(local.getTime()) ||
      local.getFullYear() !== year ||
      local.getMonth() !== month - 1 ||
      local.getDate() !== day
    ) {
      return null
    }
    return localDateKey(local)
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return localDateKey(parsed)
}

function shiftLocalDateKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number)
  const local = new Date(year, month - 1, day)
  local.setDate(local.getDate() + days)
  return localDateKey(local)
}

/**
 * Daily streak from the last mission calendar date in the player's local timezone.
 * Pass the stored current streak so a yesterday continue can increment it.
 */
export function calculateStreak(
  lastMissionDate: string | Date | null | undefined,
  currentStreak = 0
): StreakResult {
  const today = localDateKey()
  const last = parseLocalDateKey(lastMissionDate)
  const safeCurrent = Math.max(0, Math.floor(Number(currentStreak) || 0))

  if (!last) {
    return { streak: 1, bonus: true, lastMissionDate: today }
  }

  if (last === today) {
    return { streak: Math.max(safeCurrent, 1), bonus: false, lastMissionDate: today }
  }

  if (last === shiftLocalDateKey(today, -1)) {
    return { streak: safeCurrent + 1, bonus: true, lastMissionDate: today }
  }

  return { streak: 1, bonus: true, lastMissionDate: today }
}

export function isMissionDayToday(lastMissionDate: string | Date | null | undefined) {
  const last = parseLocalDateKey(lastMissionDate)
  return last !== null && last === localDateKey()
}
