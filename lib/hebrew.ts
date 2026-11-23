export function normalizeHebrew(value: string) {
  return value
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[״"׳']/g, "")
    .replace(/[^\u05D0-\u05EAa-zA-Z0-9]/g, "")
    .trim()
    .toLowerCase()
}

export function answersMatch(input: string, accepted: string[]) {
  const normalized = normalizeHebrew(input)
  if (!normalized) return false
  return accepted.some((answer) => normalizeHebrew(answer) === normalized)
}
