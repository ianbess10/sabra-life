"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import { Canvas } from "@react-three/fiber"
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from "three"
import { toast } from "sonner"
import { Film, Smartphone, Volume2, VolumeX } from "lucide-react"

import { DuskSting } from "@/components/dusk-sting"
import { GtaPhone } from "@/components/gta-phone"
import { GtaScene } from "@/components/gta-scene"
import { ParkingTrailer } from "@/components/parking-trailer"
import { StreetMission } from "@/components/street-mission"
import { Button } from "@/components/ui/button"
import { useStreetAudio } from "@/hooks/use-street-audio"
import { CAFE, cafeBlocked, nearBarista, nearCafeDoor } from "@/lib/interior"
import {
  hayarkonRamzors,
  ramzorAt,
  ramzorDriveLine,
  ramzorSignal,
  type Signal,
} from "@/lib/lights"
import { hayarkonDriveLine, onHayarkonSidewalk, stallAt } from "@/lib/parking"
import { TRAILER_DURATION, trailerProgress, type TrailerKind } from "@/lib/trailer"
import { ownedVehicleItem } from "@/lib/catalog"
import { UI } from "@/lib/copy"
import { getMission, nextAvailableMission } from "@/lib/missions"
import { levelFromXp } from "@/lib/levels"
import { useGameStore } from "@/lib/store"
import type { Mission } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  COP_LINES,
  INTERACT_R,
  MAGGIE_LINES,
  PED_LINES,
  blocked,
  dist,
  onRoad,
  worldForCity,
  type Landmark,
  type WorldMap,
} from "@/lib/world"
import type { LiveActor, LiveWorld } from "@/lib/world3d"

type Actor = LiveActor & { lineT: number }

type Stick = { x: number; y: number }

function seedActors(map: WorldMap): Actor[] {
  const actors: Actor[] = []
  const pal = ["#e7e5e4", "#fecaca", "#fed7aa", "#fde68a", "#bbf7d0", "#bae6fd", "#ddd6fe"]
  for (let i = 0; i < 26; i++) {
    const road = map.roads[i % map.roads.length]
    const along = ((i * 97) % 1000) / 1000
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
  for (let i = 0; i < 10; i++) {
    const hayarkon = map.roads.find((road) => road.name === "hayarkon")
    const road = i < 6 && hayarkon ? hayarkon : map.roads[(i * 2) % map.roads.length]
    const along = ((i * 131) % 1000) / 1000
    const horiz = road.w > road.h
    const x = horiz ? road.x + along * road.w : road.x + 22
    const y = horiz ? road.y + 22 : road.y + along * road.h
    actors.push({
      id: `car-${i}`,
      kind: "car",
      x,
      y,
      vx: horiz ? (i % 2 === 0 ? 90 : -90) : 0,
      vy: horiz ? 0 : i % 2 === 0 ? 96 : -96,
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

function heelMaggie(
  maggie: {
    x: number
    y: number
    facing: number
    moving: boolean
    sitting: boolean
    line: string | null
    lineT: number
  },
  map: WorldMap,
  px: number,
  py: number,
  facing: number,
  driving: boolean,
  playerMoving: boolean,
  dt: number,
  collide = true
) {
  const behind = driving ? 2 : 10
  const side = driving ? 14 : 24
  const tx = px - Math.cos(facing) * behind + Math.cos(facing + Math.PI / 2) * side
  const ty = py - Math.sin(facing) * behind + Math.sin(facing + Math.PI / 2) * side
  const catchup = driving ? 10 : playerMoving ? 3.4 : 1.8
  const nx = maggie.x + (tx - maggie.x) * Math.min(1, dt * catchup)
  const ny = maggie.y + (ty - maggie.y) * Math.min(1, dt * catchup)
  if (!collide || !blocked(map, nx, maggie.y, 8)) maggie.x = nx
  if (!collide || !blocked(map, maggie.x, ny, 8)) maggie.y = ny
  maggie.moving = playerMoving && Math.hypot(tx - maggie.x, ty - maggie.y) > 3
  maggie.sitting = !playerMoving && !driving
  if (maggie.moving) maggie.facing = Math.atan2(ty - maggie.y, tx - maggie.x) || maggie.facing
  maggie.lineT -= dt
  if (maggie.lineT <= 0) maggie.line = null
  if (playerMoving && Math.random() < 0.004) {
    maggie.line = MAGGIE_LINES[Math.floor(Math.random() * MAGGIE_LINES.length)]
    maggie.lineT = 1.8
  }
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
  const setInVehicle = useGameStore((state) => state.setInVehicle)
  const penalizeMistake = useGameStore((state) => state.penalizeMistake)
  const map = useMemo(() => worldForCity(location), [location])
  const level = levelFromXp(xp).level
  const next = nextAvailableMission(location, level, completed)
  const vehicle = ownedVehicleItem(inventory)
  const [spot, setSpot] = useState({
    x: worldX,
    y: worldY,
    facing: 0,
    maggieX: worldX - 28,
    maggieY: worldY + 18,
    maggieLine: null as string | null,
  })

  const [phoneOpen, setPhoneOpen] = useState(false)
  const [active, setActive] = useState<Mission | null>(null)
  const [near, setNear] = useState<Landmark | null>(null)
  const [sprint, setSprint] = useState(false)
  const [sting, setSting] = useState(true)
  const [interior, setInterior] = useState<"street" | "cafe">("street")
  const [trailerOn, setTrailerOn] = useState(false)
  const [trailerUi, setTrailerUi] = useState(0)
  const [trailerKind, setTrailerKind] = useState<TrailerKind>("ramzor")
  const { muted, setMuted } = useStreetAudio(!welcomeOpen && !phoneOpen && !trailerOn)
  const streetHold = useRef({ x: worldX, y: worldY, facing: 0 })
  const trailerRef = useRef(false)
  const trailerClock = useRef(0)
  const trailerKindRef = useRef<TrailerKind>("ramzor")
  const ramzorHoldRef = useRef<Signal | null>(null)
  const ramzorFineT = useRef(0)
  const ramzors = useMemo(() => hayarkonRamzors(map), [map])
  const e2e = process.env.NEXT_PUBLIC_E2E === "1"
  const keys = useRef(new Set<string>())
  const stick = useRef<Stick>({ x: 0, y: 0 })
  const pos = useRef({ x: worldX, y: worldY })
  const actors = useRef<Actor[]>(seedActors(map))
  const bumpT = useRef(0)
  const wantedT = useRef(0)
  const storeT = useRef(0)
  const hudT = useRef(0)
  const moving = useRef(false)
  const facingRef = useRef(0)
  const maggie = useRef({
    x: worldX - 28,
    y: worldY + 18,
    facing: 0,
    moving: false,
    sitting: false,
    line: null as string | null,
    lineT: 0,
  })
  const taxiRide = active?.id === "bg_taxi"
  const driving = taxiRide || (inVehicle && Boolean(vehicle) && vehicle?.id !== "rav-kav")
  const talking = Boolean(active) && !taxiRide
  const paused = welcomeOpen || phoneOpen || talking
  const frame = useRef<HTMLDivElement>(null)
  const live = useRef<LiveWorld>({
    x: worldX,
    y: worldY,
    facing: 0,
    moving: false,
    driving,
    taxiRide: Boolean(taxiRide),
    gender,
    wanted,
    nextId: next?.id ?? null,
    actors: actors.current,
    maggieX: worldX - 28,
    maggieY: worldY + 18,
    maggieFacing: 0,
    maggieMoving: false,
    maggieSitting: false,
    maggieLine: null,
    interior: "street",
    trailer: false,
    ramzorHold: null,
  })

  useEffect(() => {
    pos.current = { x: worldX, y: worldY }
  }, [worldX, worldY])

  const cityRef = useRef(location)
  useEffect(() => {
    actors.current = seedActors(map)
    live.current.actors = actors.current
    if (cityRef.current !== location) {
      cityRef.current = location
      pos.current = { ...map.spawn }
      maggie.current.x = map.spawn.x - 28
      maggie.current.y = map.spawn.y + 18
      setWorldPos(map.spawn.x, map.spawn.y)
    }
  }, [location, map, setWorldPos])

  useEffect(() => {
    document.documentElement.classList.add("gta-mode")
    return () => document.documentElement.classList.remove("gta-mode")
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

  const enterCafe = useCallback(
    (atBarista = false) => {
      if (interior !== "cafe") {
        streetHold.current = { x: pos.current.x, y: pos.current.y, facing: facingRef.current }
      }
      setInterior("cafe")
      setInVehicle(false)
      const spot = atBarista ? CAFE.barista : CAFE.spawn
      pos.current = { x: atBarista ? spot.x - 48 : spot.x, y: spot.y }
      facingRef.current = 0
      maggie.current.x = pos.current.x - 16
      maggie.current.y = pos.current.y + 10
      setWorldPos(pos.current.x, pos.current.y)
    },
    [interior, setInVehicle, setWorldPos]
  )

  const exitCafe = useCallback(() => {
    setInterior("street")
    pos.current = { x: streetHold.current.x, y: streetHold.current.y }
    facingRef.current = streetHold.current.facing
    maggie.current.x = pos.current.x - 22
    maggie.current.y = pos.current.y + 14
    setWorldPos(pos.current.x, pos.current.y)
  }, [setWorldPos])

  const stopTrailer = useCallback(() => {
    const justPlayed = trailerKindRef.current
    trailerRef.current = false
    trailerClock.current = 0
    ramzorHoldRef.current = null
    trailerKindRef.current = justPlayed === "ramzor" ? "parking" : "ramzor"
    setTrailerOn(false)
    setTrailerUi(0)
    pos.current = { x: streetHold.current.x, y: streetHold.current.y }
    facingRef.current = streetHold.current.facing
    setWorldPos(pos.current.x, pos.current.y)
    if (!vehicle || vehicle.id === "rav-kav") setInVehicle(false)
  }, [setInVehicle, setWorldPos, vehicle])

  const startTrailer = useCallback(
    (kind: TrailerKind = trailerKindRef.current) => {
      if (trailerRef.current) return
      streetHold.current = { x: pos.current.x, y: pos.current.y, facing: facingRef.current }
      trailerClock.current = 0
      trailerKindRef.current = kind
      trailerRef.current = true
      ramzorHoldRef.current = kind === "ramzor" ? "red" : null
      setTrailerKind(kind)
      setTrailerOn(true)
      setTrailerUi(0)
      setPhoneOpen(false)
      setActive(null)
      setInterior("street")
      setInVehicle(true)
      const line = kind === "parking" ? hayarkonDriveLine(map) : ramzorDriveLine(map)
      pos.current = { x: line.x, y: line.y0 }
      facingRef.current = Math.PI / 2
    },
    [map, setInVehicle]
  )

  useEffect(() => {
    if (welcomeOpen) {
      setSting(true)
      return
    }
    const timer = window.setTimeout(() => {
      setSting(false)
      if (!e2e) startTrailer("ramzor")
    }, 5200)
    return () => window.clearTimeout(timer)
  }, [e2e, startTrailer, welcomeOpen])

  const playMission = useCallback(
    (mission: Mission) => {
      setPhoneOpen(false)
      if (mission.id === "bg_taxi") {
        const taxi = map.landmarks.find((item) => item.id === "taxi")
        if (taxi) {
          pos.current = { x: taxi.x, y: taxi.y }
          setWorldPos(taxi.x, taxi.y)
        }
        setInterior("street")
        setInVehicle(true)
      }
      if (mission.id === "ta_parking") {
        const parking = map.landmarks.find((item) => item.id === "parking")
        const hayarkon = map.roads.find((road) => road.name === "hayarkon")
        if (parking) {
          const x = hayarkon ? hayarkon.x + hayarkon.w * 0.55 : parking.x
          pos.current = { x, y: parking.y }
          facingRef.current = Math.PI
          setWorldPos(x, parking.y)
        }
        setInterior("street")
      }
      if (mission.id === "ta_cafe_01") {
        enterCafe(true)
      }
      setActive(mission)
    },
    [enterCafe, map, setInVehicle, setWorldPos]
  )

  const tryInteract = useCallback(() => {
    if (trailerRef.current) return
    if (interior === "cafe") {
      if (nearCafeDoor(pos.current.x, pos.current.y)) {
        exitCafe()
        return
      }
      if (nearBarista(pos.current.x, pos.current.y)) {
        const mission = getMission("ta_cafe_01")
        if (mission) playMission(mission)
      }
      return
    }
    if (paused && !taxiRide) return
    const landmark = near
    if (!landmark) return
    if (landmark.id === "cafe") {
      enterCafe(false)
      return
    }
    const mission = getMission(landmark.missionId)
    if (!mission || mission.minLevel > level) {
      toast.error("עוד לא ברמה הזו.")
      return
    }
    playMission(mission)
  }, [enterCafe, exitCafe, interior, level, near, paused, playMission, taxiRide])

  const tryVehicle = useCallback(() => {
    if (trailerRef.current || interior === "cafe") return
    if (near?.id === "taxi") {
      const mission = getMission("bg_taxi")
      if (mission) playMission(mission)
      return
    }
    const ride = inVehicle || taxiRide
    if (ride) {
      const stall = stallAt(map, pos.current.x, pos.current.y)
      if (stall?.kind === "blue") {
        const mission = getMission("ta_parking")
        if (mission) playMission(mission)
        return
      }
      if (stall?.kind === "red") {
        const fine = penalizeMistake()
        useGameStore.getState().setWanted(Math.min(5, useGameStore.getState().wanted + 1))
        toast.error(`אדום־לבן אסור. −${fine || 5}₪`)
        return
      }
      if (onHayarkonSidewalk(map, pos.current.x, pos.current.y)) {
        const fine = penalizeMistake()
        useGameStore.getState().setWanted(Math.min(5, useGameStore.getState().wanted + 1))
        toast.error(`על המדרכה? דו״ח. −${fine || 5}₪`)
        return
      }
    }
    if (!vehicle || vehicle.id === "rav-kav") {
      toast.error("אין לך רכב. יד2 מחכה — או תעמוד ליד מונית.")
      return
    }
    setInVehicle(!inVehicle)
  }, [inVehicle, interior, map, near?.id, penalizeMistake, playMission, setInVehicle, taxiRide, vehicle])

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
      if (trailerRef.current) {
        trailerClock.current += dt
        const kind = trailerKindRef.current
        const { t, drive, veer, run, fail } = trailerProgress(trailerClock.current, kind)
        if (kind === "parking") {
          const line = hayarkonDriveLine(map)
          pos.current.x = line.x + (line.sidewalkX - line.x) * veer
          pos.current.y = line.y0 + (line.y1 - line.y0) * drive
          facingRef.current = veer > 0.15 ? Math.PI : Math.PI / 2
        } else {
          const line = ramzorDriveLine(map)
          pos.current.x = line.x
          pos.current.y = line.y0 + (line.stopY - line.y0) * drive + (line.y1 - line.stopY) * run
          facingRef.current = Math.PI / 2
          ramzorHoldRef.current = "red"
        }
        moving.current = !fail
        if (fail && useGameStore.getState().wanted < 1) {
          useGameStore.getState().setWanted(1)
        }
        hudT.current += dt
        if (hudT.current > 0.08) {
          hudT.current = 0
          setTrailerUi(t)
          setSpot({
            x: pos.current.x,
            y: pos.current.y,
            facing: facingRef.current,
            maggieX: maggie.current.x,
            maggieY: maggie.current.y,
            maggieLine: maggie.current.line,
          })
        }
        if (t >= TRAILER_DURATION) {
          stopTrailer()
        }
      } else if (!paused) {
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
        const ride = useGameStore.getState().inVehicle || taxiRide
        const stars = useGameStore.getState().wanted
        let speed = sprint ? 210 : 135
        if (ride) {
          const id = vehicle?.id
          speed = taxiRide ? 300 : id === "tesla" ? 420 : id === "mazda" ? 340 : 260
        }
        moving.current = len > 0.08
        if (len > 0.08) {
          const nx = pos.current.x + ax * speed * dt
          const ny = pos.current.y + ay * speed * dt
          const wall = interior === "cafe" ? cafeBlocked : (x: number, y: number) => blocked(map, x, y)
          if (!wall(nx, pos.current.y)) pos.current.x = nx
          if (!wall(pos.current.x, ny)) pos.current.y = ny
          facingRef.current = Math.atan2(ay, ax)
        }
        bumpT.current -= dt
        wantedT.current += dt
        storeT.current += dt
        ramzorFineT.current -= dt
        if (
          ride &&
          moving.current &&
          interior === "street" &&
          ramzorFineT.current <= 0
        ) {
          const hold =
            ramzorHoldRef.current ??
            (typeof window !== "undefined"
              ? ((window as Window & { __SABRA_FORCE_RAMZOR__?: Signal | null }).__SABRA_FORCE_RAMZOR__ ??
                null)
              : null)
          const hit = ramzorAt(ramzors, pos.current.x, pos.current.y)
          if (hit && ramzorSignal(now, hit.index, hold) === "red") {
            ramzorFineT.current = 2.8
            const fine = penalizeMistake()
            useGameStore.getState().setWanted(Math.min(5, useGameStore.getState().wanted + 1))
            toast.error(`ברמזור אדום? דו״ח. −${fine || 5}₪`)
          }
        }
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
              actor.x -= (dx / d) * 40
              actor.y -= (dy / d) * 40
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
              const nextStars = Math.min(5, useGameStore.getState().wanted + (ride ? 2 : 1))
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
        hudT.current += dt
        if (hudT.current > 0.05) {
          hudT.current = 0
          setNear(closest)
          setSpot({
            x: pos.current.x,
            y: pos.current.y,
            facing: facingRef.current,
            maggieX: maggie.current.x,
            maggieY: maggie.current.y,
            maggieLine: maggie.current.line,
          })
        }
        if (storeT.current > 0.8) {
          storeT.current = 0
          setWorldPos(pos.current.x, pos.current.y)
        }
      } else {
        moving.current = false
      }
      heelMaggie(
        maggie.current,
        map,
        pos.current.x,
        pos.current.y,
        facingRef.current,
        Boolean(driving) || trailerRef.current,
        moving.current,
        dt,
        interior !== "cafe"
      )
      live.current = {
        x: pos.current.x,
        y: pos.current.y,
        facing: facingRef.current,
        moving: moving.current,
        driving: Boolean(driving) || trailerRef.current,
        taxiRide: Boolean(taxiRide),
        gender,
        wanted: useGameStore.getState().wanted,
        nextId: next?.id ?? null,
        actors: actors.current,
        maggieX: maggie.current.x,
        maggieY: maggie.current.y,
        maggieFacing: maggie.current.facing,
        maggieMoving: maggie.current.moving,
        maggieSitting: maggie.current.sitting,
        maggieLine: maggie.current.line,
        interior,
        trailer: trailerRef.current,
        ramzorHold:
          ramzorHoldRef.current ??
          (typeof window !== "undefined"
            ? ((window as Window & { __SABRA_FORCE_RAMZOR__?: Signal | null }).__SABRA_FORCE_RAMZOR__ ??
              null)
            : null),
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [driving, gender, interior, map, next?.id, paused, penalizeMistake, ramzors, setInVehicle, setWorldPos, sprint, stopTrailer, taxiRide, vehicle])

  function onMissionFinished(mission: Mission) {
    if (mission.id !== "bg_taxi") return
    const cafe = map.landmarks.find((item) => item.id === "cafe")
    if (cafe) {
      pos.current = { x: cafe.x, y: cafe.y }
      setWorldPos(cafe.x, cafe.y)
    }
    if (!vehicle || vehicle.id === "rav-kav") setInVehicle(false)
  }

  return (
    <div
      ref={frame}
      className="relative min-h-0 flex-1 overflow-hidden bg-[#14081f]"
      data-testid="gta-world"
      tabIndex={0}
    >
      <div dir="ltr" className="absolute inset-0" data-testid="gta-canvas">
        <Canvas
          shadows={process.env.NEXT_PUBLIC_E2E !== "1"}
          dpr={[1, 1.5]}
          camera={{ fov: 50, near: 0.1, far: 420, position: [40, 12, 48] }}
          gl={{ antialias: true, alpha: false, toneMapping: ACESFilmicToneMapping }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = process.env.NEXT_PUBLIC_E2E !== "1"
            gl.shadowMap.type = PCFShadowMap
            gl.toneMapping = ACESFilmicToneMapping
            gl.toneMappingExposure = 1.12
            gl.outputColorSpace = SRGBColorSpace
          }}
        >
          <GtaScene
            map={map}
            live={live}
            gender={gender}
            driving={Boolean(driving) || trailerOn}
            taxiRide={Boolean(taxiRide)}
            interior={interior}
          />
        </Canvas>
      </div>

      <Radar
        map={map}
        x={spot.x}
        y={spot.y}
        facing={spot.facing}
        nextId={next?.id ?? null}
        wanted={wanted}
        maggieX={spot.maggieX}
        maggieY={spot.maggieY}
      />

      <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
        <p
          data-testid="gta-player"
          className="rounded-full bg-black/50 px-3 py-1 text-center text-xs text-white/90"
        >
          {gender === "female" ? "עולה חדשה" : "עולה חדש"} ·{" "}
          {interior === "cafe"
            ? UI.inCafe.he
            : driving || trailerOn
              ? taxiRide
                ? "מונית"
                : vehicle?.nameHe ?? UI.trailer.he
              : "ברגל"}
          {" · "}
          <span data-testid="gta-maggie">{UI.maggie.he}</span>
          {spot.maggieLine ? ` · ${spot.maggieLine}` : ""}
        </p>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
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
        <Button
          type="button"
          data-testid="street-audio-toggle"
          size="icon"
          variant="secondary"
          onClick={() => setMuted((value) => !value)}
          className="size-11 rounded-full bg-black/50 text-white shadow-lg hover:bg-black/70"
          title={muted ? UI.unmuteStreet.he : UI.muteStreet.he}
        >
          {muted ? <VolumeX /> : <Volume2 />}
          <span className="sr-only">{muted ? UI.unmuteStreet.he : UI.muteStreet.he}</span>
        </Button>
        <Button
          type="button"
          data-testid="parking-trailer-button"
          size="icon"
          variant="secondary"
          onClick={() => (trailerOn ? stopTrailer() : startTrailer())}
          className="size-11 rounded-full bg-black/50 text-white shadow-lg hover:bg-black/70"
          title={UI.trailer.he}
        >
          <Film />
          <span className="sr-only">{UI.trailer.he}</span>
        </Button>
      </div>

      <DuskSting show={sting && !welcomeOpen && !phoneOpen && !active && !trailerOn} />
      {trailerOn ? <ParkingTrailer time={trailerUi} kind={trailerKind} onSkip={stopTrailer} /> : null}

      <Joystick
        onMove={(x, y) => {
          stick.current = { x, y }
        }}
      />

      <div className="absolute right-3 bottom-6 z-20 flex flex-col gap-2 md:hidden">
        <Button
          data-testid="world-interact"
          disabled={interior !== "cafe" && !near}
          onClick={tryInteract}
          className="h-14 w-14 rounded-full text-lg"
        >
          E
        </Button>
        <Button variant="secondary" className="h-12 w-14 rounded-full" onClick={tryVehicle}>
          F
        </Button>
      </div>

      {interior === "cafe" && !phoneOpen && !active && !trailerOn ? (
        <Button
          data-testid="world-interact-desktop"
          className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:inline-flex"
          onClick={tryInteract}
        >
          E · {nearCafeDoor(spot.x, spot.y) ? UI.exitCafe.he : UI.orderCoffee.he}
        </Button>
      ) : near && !phoneOpen && !active && !trailerOn ? (
        <Button
          data-testid="world-interact-desktop"
          className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:inline-flex"
          onClick={tryInteract}
        >
          E · {near.id === "cafe" ? UI.enterCafe.he : near.nameHe}
        </Button>
      ) : null}

      <GtaPhone open={phoneOpen} onClose={() => setPhoneOpen(false)} onPlayMission={playMission} />

      <StreetMission
        mission={active}
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) {
            setActive(null)
            if (taxiRide && (!vehicle || vehicle.id === "rav-kav")) setInVehicle(false)
          }
        }}
        onFinished={onMissionFinished}
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
  maggieX,
  maggieY,
}: {
  map: WorldMap
  x: number
  y: number
  facing: number
  nextId: string | null
  wanted: number
  maggieX: number
  maggieY: number
}) {
  const size = 148
  const range = 540
  const scale = size / (range * 2)
  return (
    <div className="absolute bottom-4 left-4 z-20" data-testid="gta-radar">
      <div className="mb-1 flex justify-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={cn("text-sm", index < wanted ? "text-yellow-300" : "text-white/20")}>
            ★
          </span>
        ))}
      </div>
      <div
        className="relative overflow-hidden rounded-full border-2 border-white/30 bg-[#1a0b24]/90 shadow-xl"
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
          className="absolute size-2.5 rounded-sm bg-amber-300 ring-2 ring-zinc-900"
          data-testid="gta-maggie-blip"
          style={{
            left: (maggieX - x + range) * scale,
            top: (maggieY - y + range) * scale,
            transform: "translate(-50%, -50%)",
          }}
        />
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
  function point(event: PointerEvent<HTMLDivElement>) {
    const node = pad.current
    if (!node) return
    const box = node.getBoundingClientRect()
    const px = ((event.clientX - box.left) / box.width) * 2 - 1
    const py = ((event.clientY - box.top) / box.height) * 2 - 1
    const len = Math.hypot(px, py) || 1
    onMove(px / (len > 1 ? len : 1), py / (len > 1 ? len : 1))
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
