export type InteriorId = "cafe"

export const CAFE = {
  w: 168,
  h: 118,
  spawn: { x: 24, y: 58 },
  barista: { x: 132, y: 58 },
  door: { x: 16, y: 58 },
  counter: { x: 112, y: 22, w: 44, h: 74 },
}

export function cafeBlocked(x: number, y: number, r = 12) {
  if (x < r || y < r || x > CAFE.w - r || y > CAFE.h - r) return true
  const c = CAFE.counter
  const nx = Math.max(c.x, Math.min(x, c.x + c.w))
  const ny = Math.max(c.y, Math.min(y, c.y + c.h))
  const dx = x - nx
  const dy = y - ny
  return dx * dx + dy * dy < r * r
}

export function nearCafeDoor(x: number, y: number) {
  return Math.hypot(x - CAFE.door.x, y - CAFE.door.y) < 28
}

export function nearBarista(x: number, y: number) {
  return Math.hypot(x - CAFE.barista.x, y - CAFE.barista.y) < 42
}
