import { onRoad, type Stall, type WorldMap } from "@/lib/world"

export function stallAt(map: WorldMap, x: number, y: number): Stall | null {
  return (
    map.stalls.find(
      (stall) => x >= stall.x && x <= stall.x + stall.w && y >= stall.y && y <= stall.y + stall.h
    ) ?? null
  )
}

export function onHayarkonSidewalk(map: WorldMap, x: number, y: number) {
  const road = map.roads.find((item) => item.name === "hayarkon")
  if (!road) return false
  if (onRoad(map, x, y)) return false
  if (
    map.lots.some(
      (lot) => x >= lot.x && x <= lot.x + lot.w && y >= lot.y && y <= lot.y + lot.h
    )
  ) {
    return false
  }
  const pad = 38
  return (
    x >= road.x - pad &&
    x <= road.x + road.w + pad &&
    y >= road.y &&
    y <= road.y + road.h
  )
}

export function hayarkonDriveLine(map: WorldMap) {
  const road = map.roads.find((item) => item.name === "hayarkon")
  const parking = map.landmarks.find((item) => item.id === "parking")
  return {
    x: (road?.x ?? 250) + (road?.w ?? 70) * 0.55,
    y0: (parking?.y ?? 560) - 220,
    y1: parking?.y ?? 560,
    sidewalkX: (road?.x ?? 250) - 22,
  }
}
