"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Smartphone } from "lucide-react"

import { GtaPhone } from "@/components/gta-phone"
import { MissionModal } from "@/components/mission-modal"
import { Button } from "@/components/ui/button"
import { ownedVehicleItem } from "@/lib/catalog"
import { UI } from "@/lib/copy"
import { getMission, missionsForCity, nextAvailableMission } from "@/lib/missions"
import { levelFromXp } from "@/lib/levels"
import { useGameStore } from "@/lib/store"
import type { Mission } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  COP_LINES,
  INTERACT_R,
  PED_LINES,
  PLAYER_R,
  blocked,
  dist,
  onRoad,
  worldForCity,
  type Landmark,
  type WorldMap,
} from "@/lib/world"

type Actor = {
  id: string
  kind: "ped" | "cop" | "car"
  x: number
  y: number
  vx: number
  vy: number
  color: string
  line: string | null
  lineT: number
  w: number
  h: number
}

type Stick = { x: number; y: number }

function seedActors(map: WorldMap): Actor[] {
  const actors: Actor[] = []
  const pal = ["#e7e5e4", "#fecaca", "#fed7aa", "#fde68a", "#bbf7d0", "#bae6fd", "#ddd6fe"]
  for (let i = 0; i < 26; i++) {
    const road = map.roads[i % map.roads.length]
    const along = (i * 97) % 1000 / 1000
    const x = road.w > road.h ? road.x + along * road.w : road.x + road.w * 0.5
    const y = road.h > road.w ? road.y + along * road.h : road.y + road.h * 0.5
    const horiz = road.w > road.h
    actors.push({
      id: `ped-${i}`,
      kind: "ped",
      x,
      y,
      vx: horiz ? (i % 2 === 0 ? 38 : -38) : 0,
      vy: horiz ? 0 : i % 2 === 0 ? 38 : -38,
      color: pal[i % pal.length],
      line: null,
      lineT: 0,
      w: 16,
      h: 16,
    })
  }
  for (let i = 0; i < 8; i++) {
    const road = map.roads[(i * 2) % map.roads.length]
    const along = (i * 131) % 1000 / 1000
    const horiz = road.w > road.h
    const x = horiz ? road.x + along * road.w : road.x + 22
    const y = horiz ? road.y + 22 : road.y + along * road.h
    actors.push({
      id: `car-${i}`,
      kind: "car",
      x,
      y,
      vx: horiz ? (i % 2 === 0 ? 90 : -90) : 0,
      vy: horiz ? 0 : i % 2 === 0 ? 90 : -90,
      color: i % 3 === 0 ? "#facc15" : i % 3 === 1 ? "#0f172a" : "#fff7ed",
      line: null,
      lineT: 0,
      w: horiz ? 28 : 16,
      h: horiz ? 16 : 28,
    })
  }
  actors.push(
    {
      id: "cop-a",
      kind: "cop",
      x: map.landmarks.find((item) => item.id === "cop")?.x ?? map.spawn.x,
      y: map.landmarks.find((item) => item.id === "cop")?.y ?? map.spawn.y,
      vx: 0,
      vy: 0,
      color: "#1d4ed8",
      line: null,
      lineT: 0,
      w: 14,
      h: 14,
    },
    {
      id: "cop-b",
      kind: "cop",
      x: map.spawn.x + 160,
      y: map.spawn.y,
      vx: 0,
      vy: 0,
      color: "#1e3a8a",
      line: null,
      lineT: 0,
      w: 14,
      h: 14,
    }
  )
  return actors
}

function moveActor(map: WorldMap, actor: Actor, dt: number) {
  const nx = actor.x + actor.vx * dt
  const ny = actor.y + actor.vy * dt
  const hits = blocked(map, nx, ny, actor.kind === "car" ? 10 : 8)
  const offRoad = actor.kind === "car" && !onRoad(map, nx, ny)
  if (hits || offRoad || nx < 10 || ny < 10 || nx > map.w - 10 || ny > map.h - 10) {
    actor.vx *= -1
    actor.vy *= -1
    if (actor.kind === "car" && Math.random() < 0.4) {
      const swap = actor.vx
      actor.vx = actor.vy
      actor.vy = swap
    }
    return
  }
  actor.x = nx
  actor.y = ny
}

export function GtaWorld() {
  const location = useGameStore((state) => state.location)
  const gender = useGameStore((state) => state.gender)
  const inventory = useGameStore((state) => state.inventory)
  const completed = useGameStore((state) => state.completedMissions)
  const xp = useGameStore((state) => state.xp)
  const wanted = useGameStore((state) => state.wanted)
  const inVehicle = useGameStore((state) => state.inVehicle)
  const worldX = useGameStore((state) => state.worldX)
  const worldY = useGameStore((state) => state.worldY)
  const welcomeOpen = useGameStore((state) => state.welcomeOpen)
  const setWorldPos = useGameStore((state) => state.setWorldPos)
  const setWanted = useGameStore((state) => state.setWanted)
  const setInVehicle = useGameStore((state) => state.setInVehicle)
  const penalizeMistake = useGameStore((state) => state.penalizeMistake)
  const map = useMemo(() => worldForCity(location), [location])
  const level = levelFromXp(xp).level
  const next = nextAvailableMission(location, level, completed)
  const missions = missionsForCity(location)
  const vehicle = ownedVehicleItem(inventory)

  const [phoneOpen, setPhoneOpen] = useState(false)
  const [active, setActive] = useState<Mission | null>(null)
  const [near, setNear] = useState<Landmark | null>(null)
  const [facing, setFacing] = useState(0)
  const [sprint, setSprint] = useState(false)
  const [view, setView] = useState({ w: 800, h: 600, x: worldX, y: worldY })
  const keys = useRef(new Set<string>())
  const stick = useRef<Stick>({ x: 0, y: 0 })
  const pos = useRef({ x: worldX, y: worldY })
  const actors = useRef<Actor[]>(seedActors(map))
  const bumpT = useRef(0)
  const wantedT = useRef(0)
  const storeT = useRef(0)
  const paused = welcomeOpen || phoneOpen || Boolean(active)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    pos.current = { x: worldX, y: worldY }
  }, [worldX, worldY])

  const cityRef = useRef(location)
  useEffect(() => {
    actors.current = seedActors(map)
    if (cityRef.current !== location) {
      cityRef.current = location
      pos.current = { ...map.spawn }
      setWorldPos(map.spawn.x, map.spawn.y)
    }
  }, [location, map, setWorldPos])

  useEffect(() => {
    document.documentElement.classList.add("gta-mode")
    return () => document.documentElement.classList.remove("gta-mode")
  }, [])

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const read = () => setView((current) => ({ ...current, w: node.clientWidth, h: node.clientHeight }))
    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function down(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault()
      }
      keys.current.add(key)
      if (key === "p" || key === "escape") {
        if (active) return
        setPhoneOpen((open) => !open)
      }
      if (key === "shift") setSprint(true)
    }
    function up(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      keys.current.delete(key)
      if (key === "shift") setSprint(false)
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [active])

  const tryInteract = useCallback(() => {
    if (paused) return
    const landmark = near
    if (!landmark) return
    const mission = getMission(landmark.missionId)
    if (!mission || mission.minLevel > level) {
      toast.error("עוד לא ברמה הזו.")
      return
    }
    setActive(mission)
  }, [level, near, paused])

  const tryVehicle = useCallback(() => {
    if (!vehicle || vehicle.id === "rav-kav") {
      toast.error("אין לך רכב. יד2 מחכה.")
      return
    }
    setInVehicle(!inVehicle)
  }, [inVehicle, setInVehicle, vehicle])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if (key === "e" || key === "enter") tryInteract()
      if (key === "f") tryVehicle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tryInteract, tryVehicle])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!paused) {
        let ax = stick.current.x
        let ay = stick.current.y
        if (keys.current.has("w") || keys.current.has("arrowup")) ay -= 1
        if (keys.current.has("s") || keys.current.has("arrowdown")) ay += 1
        if (keys.current.has("a") || keys.current.has("arrowleft")) ax -= 1
        if (keys.current.has("d") || keys.current.has("arrowright")) ax += 1
        const len = Math.hypot(ax, ay)
        if (len > 1) {
          ax /= len
          ay /= len
        }
        const driving = useGameStore.getState().inVehicle
        const stars = useGameStore.getState().wanted
        let speed = sprint ? 210 : 135
        if (driving) {
          const id = vehicle?.id
          speed = id === "tesla" ? 420 : id === "mazda" ? 340 : 260
        }
        if (len > 0.08) {
          const nx = pos.current.x + ax * speed * dt
          const ny = pos.current.y + ay * speed * dt
          if (!blocked(map, nx, pos.current.y)) pos.current.x = nx
          if (!blocked(map, pos.current.x, ny)) pos.current.y = ny
          setFacing(Math.atan2(ay, ax))
        }
        bumpT.current -= dt
        wantedT.current += dt
        storeT.current += dt
        for (const actor of actors.current) {
          if (actor.kind === "cop" && stars > 0) {
            const dx = pos.current.x - actor.x
            const dy = pos.current.y - actor.y
            const d = Math.hypot(dx, dy) || 1
            const chase = 70 + stars * 18
            actor.vx = (dx / d) * chase
            actor.vy = (dy / d) * chase
            actor.line = COP_LINES[Math.floor(now / 900) % COP_LINES.length]
            actor.lineT = 1
            if (d < 28) {
              const fine = penalizeMistake()
              useGameStore.getState().setWanted(stars - 1)
              actor.x -= dx / d * 40
              actor.y -= dy / d * 40
              toast.error(`עצור! −${fine || 5}₪`)
            }
          } else {
            moveActor(map, actor, dt)
            actor.lineT -= dt
            if (actor.lineT <= 0) actor.line = null
            if (actor.kind === "ped" && Math.random() < 0.002) {
              actor.line = PED_LINES[Math.floor(Math.random() * PED_LINES.length)]
              actor.lineT = 2.4
            }
          }
          const hitR = actor.kind === "car" ? 18 : 16
          if (bumpT.current <= 0 && dist(actor.x, actor.y, pos.current.x, pos.current.y) < hitR) {
            bumpT.current = 0.7
            if (actor.kind !== "cop") {
              const nextStars = Math.min(5, useGameStore.getState().wanted + (driving ? 2 : 1))
              useGameStore.getState().setWanted(nextStars)
              wantedT.current = 0
              actor.line = actor.kind === "car" ? "תזהר!" : "אוי!"
              actor.lineT = 1.6
            }
          }
        }
        if (stars > 0 && wantedT.current > 11) {
          useGameStore.getState().setWanted(stars - 1)
          wantedT.current = 0
        }
        let closest: Landmark | null = null
        let best = INTERACT_R
        for (const landmark of map.landmarks) {
          const d = dist(landmark.x, landmark.y, pos.current.x, pos.current.y)
          if (d < best) {
            best = d
            closest = landmark
          }
        }
        setNear(closest)
        setView((current) => ({ ...current, x: pos.current.x, y: pos.current.y }))
        if (storeT.current > 0.8) {
          storeT.current = 0
          setWorldPos(pos.current.x, pos.current.y)
        }
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [map, paused, penalizeMistake, setWorldPos, sprint, vehicle])

  const camX = Math.max(0, Math.min(map.w - view.w, view.x - view.w / 2))
  const camY = Math.max(0, Math.min(map.h - view.h, view.y - view.h / 2))
  const driving = inVehicle && Boolean(vehicle) && vehicle?.id !== "rav-kav"

  function playMission(mission: Mission) {
    setPhoneOpen(false)
    setActive(mission)
  }

  return (
    <div
      ref={frame}
      className="relative min-h-0 flex-1 overflow-hidden bg-[#123322]"
      data-testid="gta-world"
      tabIndex={0}
    >
      <div
        dir="ltr"
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          width: map.w,
          height: map.h,
          transform: `translate(${-camX}px, ${-camY}px)`,
        }}
      >
        <div className="absolute inset-0 bg-[#2f6b46]" />
        {map.sea ? (
          <div
            className="absolute bg-[#1d4e89]"
            style={{ left: map.sea.x, top: map.sea.y, width: map.sea.w, height: map.sea.h }}
          />
        ) : null}
        {map.sand ? (
          <div
            className="absolute bg-[#e4c68a]"
            style={{ left: map.sand.x, top: map.sand.y, width: map.sand.w, height: map.sand.h }}
          />
        ) : null}
        {map.parks.map((park, index) => (
          <div
            key={`park-${index}`}
            className="absolute bg-[#3f7d4e]"
            style={{ left: park.x, top: park.y, width: park.w, height: park.h }}
          />
        ))}
        {map.roads.map((road, index) => (
          <div
            key={`road-${index}`}
            className="absolute bg-[#3f3f46]"
            style={{ left: road.x, top: road.y, width: road.w, height: road.h }}
          >
            <div
              className="absolute bg-[repeating-linear-gradient(to_right,transparent_0_18px,#facc15_18px_34px)]"
              style={
                road.w > road.h
                  ? { left: 8, top: "50%", height: 3, width: "calc(100% - 16px)", transform: "translateY(-50%)" }
                  : {
                      left: "50%",
                      top: 8,
                      width: 3,
                      height: "calc(100% - 16px)",
                      transform: "translateX(-50%)",
                      background: "repeating-linear-gradient(to bottom, transparent 0 18px, #facc15 18px 34px)",
                    }
              }
            />
          </div>
        ))}
        {map.buildings.map((building, index) => (
          <div
            key={`b-${index}`}
            className="absolute overflow-hidden shadow-[0_8px_0_rgba(0,0,0,0.18)]"
            style={{
              left: building.x,
              top: building.y,
              width: building.w,
              height: building.h,
              background: building.fill,
            }}
          >
            <div
              className="h-2 w-full"
              style={{ background: building.roof ?? "#7f1d1d" }}
            />
            <div className="absolute inset-x-2 top-4 grid grid-cols-4 gap-1 opacity-35">
              {Array.from({ length: 8 }, (_, window) => (
                <span key={window} className="h-2 rounded-[1px] bg-[#1e293b]" />
              ))}
            </div>
            {building.label ? (
              <p dir="rtl" className="relative px-2 pt-8 font-heading text-[11px] leading-tight text-zinc-800">
                {building.label}
              </p>
            ) : null}
          </div>
        ))}

        {map.landmarks.map((landmark) => {
          const mission = missions.find((item) => item.id === landmark.missionId)
          const done = completed.includes(landmark.missionId)
          const isNext = next?.id === landmark.missionId
          return (
            <div
              key={landmark.id}
              className="absolute"
              style={{ left: landmark.x, top: landmark.y, transform: "translate(-50%, -50%)" }}
            >
              {isNext ? (
                <div className="absolute left-1/2 top-[-22px] size-3 -translate-x-1/2 animate-bounce rounded-full bg-yellow-400 shadow-[0_0_12px_#facc15]" />
              ) : null}
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 border-white/80 shadow-md",
                  done && "opacity-50"
                )}
                style={{ background: landmark.color }}
              >
                <span className="font-heading text-[10px] text-white">
                  {landmark.nameHe.slice(0, 1)}
                </span>
              </div>
              <p dir="rtl" className="mt-1 whitespace-nowrap text-center text-[10px] font-medium text-white drop-shadow">
                {landmark.nameHe}
              </p>
              {mission && near?.id === landmark.id ? (
                <p
                  dir="rtl"
                  className="absolute left-1/2 top-full mt-6 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-[10px] text-yellow-300"
                >
                  E · {mission.title}
                </p>
              ) : null}
            </div>
          )
        })}

        {actors.current.map((actor) => (
          <div
            key={actor.id}
            className="absolute"
            style={{
              left: actor.x,
              top: actor.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {actor.kind === "car" ? (
              <div
                className="rounded-[3px] border border-black/30 shadow"
                style={{ width: actor.w, height: actor.h, background: actor.color }}
              />
            ) : (
              <div className="relative h-7 w-5">
                <div
                  className="absolute bottom-0 left-1/2 h-4 w-3.5 -translate-x-1/2 rounded-[5px]"
                  style={{ background: actor.kind === "cop" ? "#1d4ed8" : actor.color }}
                />
                <div
                  className="absolute left-1/2 top-0 size-3 -translate-x-1/2 rounded-full border border-white/70"
                  style={{ background: actor.kind === "cop" ? "#93c5fd" : "#fde68a" }}
                />
              </div>
            )}
            {actor.line ? (
              <span
                dir="rtl"
                className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[10px] text-zinc-900 shadow"
              >
                {actor.line}
              </span>
            ) : null}
          </div>
        ))}

        <div
          className="absolute z-10"
          data-testid="gta-player"
          style={{
            left: view.x,
            top: view.y,
            transform: `translate(-50%, -50%) rotate(${facing + Math.PI / 2}rad)`,
          }}
        >
          {driving ? (
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-8 w-12 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black/40 blur-[2px]" />
              <div
                className="relative h-7 w-11 rounded-[4px] border border-white/50 shadow-lg"
                style={{ background: vehicle?.id === "tesla" ? "#f8fafc" : "#1e293b" }}
              >
                <div className="absolute inset-x-1 top-0.5 h-2 rounded-sm bg-sky-300/70" />
                <div className="absolute bottom-0.5 left-0.5 size-2 rounded-full bg-amber-300" />
                <div className="absolute right-0.5 bottom-0.5 size-2 rounded-full bg-red-400" />
              </div>
            </div>
          ) : (
            <div className="relative h-12 w-9">
              <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/35 blur-[2px]" />
              <div
                className="absolute left-1/2 bottom-0 h-7 w-5 -translate-x-1/2 rounded-[7px] border-2 border-white shadow-md"
                style={{ background: gender === "female" ? "#fb7185" : "#22d3ee" }}
              />
              <div
                className="absolute left-1/2 top-0 size-5 -translate-x-1/2 rounded-full border-2 border-white"
                style={{ background: gender === "female" ? "#fecdd3" : "#fde68a" }}
              />
              <div className="absolute left-1/2 top-[-8px] h-2.5 w-2 -translate-x-1/2 rounded-sm bg-white" />
            </div>
          )}
        </div>
      </div>

      <Radar
        map={map}
        x={view.x}
        y={view.y}
        facing={facing}
        nextId={next?.id ?? null}
        wanted={wanted}
      />

      <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
        <p className="rounded-full bg-black/50 px-3 py-1 text-center text-xs text-white/90">
          {gender === "female" ? "עולה חדשה" : "עולה חדש"} · {driving ? vehicle?.nameHe : "ברגל"}
        </p>
      </div>

      <div className="absolute top-3 right-3 z-20">
        <Button
          type="button"
          data-testid="gta-phone"
          size="icon"
          onClick={() => setPhoneOpen((open) => !open)}
          className="size-11 rounded-full shadow-lg"
          title={`${UI.phone.he} · P`}
        >
          <Smartphone />
          <span className="sr-only">{UI.phone.he}</span>
        </Button>
      </div>

      <Joystick
        onMove={(x, y) => {
          stick.current = { x, y }
        }}
      />

      <div className="absolute right-3 bottom-6 z-20 flex flex-col gap-2 md:hidden">
        <Button
          data-testid="world-interact"
          disabled={!near}
          onClick={tryInteract}
          className="h-14 w-14 rounded-full text-lg"
        >
          E
        </Button>
        <Button variant="secondary" className="h-12 w-14 rounded-full" onClick={tryVehicle}>
          F
        </Button>
      </div>

      {near && !phoneOpen && !active ? (
        <Button
          data-testid="world-interact-desktop"
          className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:inline-flex"
          onClick={tryInteract}
        >
          E · {near.nameHe}
        </Button>
      ) : null}

      <GtaPhone
        open={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        onPlayMission={playMission}
      />

      <MissionModal
        mission={active}
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null)
        }}
      />
    </div>
  )
}

function Radar({
  map,
  x,
  y,
  facing,
  nextId,
  wanted,
}: {
  map: WorldMap
  x: number
  y: number
  facing: number
  nextId: string | null
  wanted: number
}) {
  const size = 148
  const range = 540
  const scale = size / (range * 2)
  return (
    <div className="absolute bottom-4 left-4 z-20" data-testid="gta-radar">
      <div className="mb-1 flex justify-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "text-sm",
              index < wanted ? "text-yellow-300" : "text-white/20"
            )}
          >
            ★
          </span>
        ))}
      </div>
      <div
        className="relative overflow-hidden rounded-full border-2 border-white/30 bg-[#052e16]/90 shadow-xl"
        style={{ width: size, height: size }}
      >
        {map.sea ? (
          <div
            className="absolute bg-[#1d4e89]"
            style={{
              left: (map.sea.x - x + range) * scale,
              top: (map.sea.y - y + range) * scale,
              width: map.sea.w * scale,
              height: map.sea.h * scale,
            }}
          />
        ) : null}
        {map.landmarks.map((landmark) => (
          <div
            key={landmark.id}
            className={cn(
              "absolute size-1.5 rounded-full",
              landmark.missionId === nextId ? "size-2.5 animate-pulse bg-yellow-300" : "bg-white/80"
            )}
            style={{
              left: (landmark.x - x + range) * scale,
              top: (landmark.y - y + range) * scale,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        <div
          className="absolute size-2.5 bg-cyan-300"
          style={{
            left: size / 2,
            top: size / 2,
            transform: `translate(-50%, -50%) rotate(${facing + Math.PI / 2}rad)`,
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          }}
        />
      </div>
    </div>
  )
}

function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const pad = useRef<HTMLDivElement>(null)
  function point(event: React.PointerEvent) {
    const node = pad.current
    if (!node) return
    const box = node.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width * 2 - 1
    const y = (event.clientY - box.top) / box.height * 2 - 1
    const len = Math.hypot(x, y) || 1
    const nx = x / (len > 1 ? len : 1)
    const ny = y / (len > 1 ? len : 1)
    onMove(nx, ny)
  }
  return (
    <div
      ref={pad}
      data-testid="gta-joystick"
      className="absolute bottom-36 left-4 z-20 size-28 rounded-full border border-white/30 bg-black/35 md:hidden"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        point(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) point(event)
      }}
      onPointerUp={() => onMove(0, 0)}
      onPointerCancel={() => onMove(0, 0)}
    />
  )
}
