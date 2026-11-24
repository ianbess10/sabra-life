import type { Rect, WorldMap } from "@/lib/world"

export type Signal = "green" | "yellow" | "red"

export type Ramzor = {
  id: string
  index: number
  x: number
  y: number
  stop: Rect
}

const CYCLE = 16
const GREEN = 8
const YELLOW = 2

export function hayarkonRamzors(map: WorldMap): Ramzor[] {
  const road = map.roads.find((item) => item.name === "hayarkon")
  if (!road) return []
  const crossings = map.roads.filter((item) => item.w > item.h)
  return crossings.slice(1, 4).map((cross, index) => ({
    id: `ramzor-${index}`,
    index,
    x: road.x + road.w + 12,
    y: cross.y + cross.h * 0.5,
    stop: {
      x: road.x,
      y: cross.y - 30,
      w: road.w,
      h: 30,
    },
  }))
}

export function ramzorSignal(nowMs: number, index: number, hold?: Signal | null): Signal {
  if (hold) return hold
  const t = (((nowMs / 1000 + index * 5) % CYCLE) + CYCLE) % CYCLE
  if (t < GREEN) return "green"
  if (t < GREEN + YELLOW) return "yellow"
  return "red"
}

export function ramzorAt(ramzors: Ramzor[], x: number, y: number) {
  return (
    ramzors.find(
      (light) =>
        x >= light.stop.x &&
        x <= light.stop.x + light.stop.w &&
        y >= light.stop.y &&
        y <= light.stop.y + light.stop.h
    ) ?? null
  )
}

export function ramzorDriveLine(map: WorldMap) {
  const road = map.roads.find((item) => item.name === "hayarkon")
  const lights = hayarkonRamzors(map)
  const light = lights[2] ?? lights[1] ?? lights[0]
  const stopY = light?.stop.y ?? 830
  return {
    x: (road?.x ?? 250) + (road?.w ?? 70) * 0.55,
    y0: stopY - 150,
    stopY,
    y1: stopY + 160,
    sidewalkX: (road?.x ?? 250) - 22,
  }
}
