"use client"

import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh, MeshStandardMaterial } from "three"
import {
  CanvasTexture,
  Color,
  MathUtils,
  Vector3,
} from "three"

import {
  buildingHeight,
  sx,
  to3,
  type LiveActor,
  type LiveWorld,
} from "@/lib/world3d"
import { CafeInterior } from "@/components/cafe-interior"
import { Maggie } from "@/components/maggie"
import { hayarkonRamzors, ramzorSignal, type Ramzor } from "@/lib/lights"
import type { Landmark, ParkedCar, WorldMap } from "@/lib/world"

const LOOK = new Vector3()
const CAM = new Vector3()
const E2E = process.env.NEXT_PUBLIC_E2E === "1"

export function GtaScene({
  map,
  live,
  gender,
  driving,
  taxiRide,
  interior,
}: {
  map: WorldMap
  live: MutableRefObject<LiveWorld>
  gender: "male" | "female"
  driving: boolean
  taxiRide: boolean
  interior: "street" | "cafe"
}) {
  const inside = interior === "cafe"
  return (
    <>
      {inside ? (
        <CafeInterior />
      ) : (
        <>
          <color attach="background" args={["#b7c6d6"]} />
          <fog attach="fog" args={["#c5d0dc", 90, 260]} />
          <hemisphereLight args={["#eef3f8", "#9aa090", 1.05]} />
          <ambientLight intensity={0.78} />
          <directionalLight color="#fff6e8" position={[36, 48, 22]} intensity={1.05} />
          <City map={map} live={live} />
          <Crowd live={live} />
          <Landmarks map={map} live={live} />
        </>
      )}
      <Player live={live} gender={gender} driving={driving} taxiRide={taxiRide} />
      <Maggie live={live} />
      <FollowCamera live={live} />
    </>
  )
}

function City({ map, live }: { map: WorldMap; live: MutableRefObject<LiveWorld> }) {
  const extent = useMemo(() => ({ w: sx(map.w), d: sx(map.h) }), [map.h, map.w])
  const ramzors = useMemo(() => hayarkonRamzors(map), [map])
  const palms = useMemo(() => {
    if (!map.sand) return [] as { x: number; z: number }[]
    const list: { x: number; z: number }[] = []
    for (let i = 0; i < 8; i++) {
      list.push({
        x: sx(map.sand.x + map.sand.w * 0.55),
        z: sx(80 + i * 240),
      })
    }
    return list
  }, [map.sand])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[extent.w / 2, -0.02, extent.d / 2]} receiveShadow>
        <planeGeometry args={[extent.w + 40, extent.d + 40]} />
        <meshStandardMaterial color="#7a9a6e" roughness={0.95} />
      </mesh>
      {map.sea ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(map.sea.x + map.sea.w / 2), -0.04, sx(map.sea.y + map.sea.h / 2)]}
        >
          <planeGeometry args={[sx(map.sea.w), sx(map.sea.h)]} />
          <meshStandardMaterial color="#4a7ca8" roughness={0.35} />
        </mesh>
      ) : null}
      {map.sand ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(map.sand.x + map.sand.w / 2), 0.01, sx(map.sand.y + map.sand.h / 2)]}
        >
          <planeGeometry args={[sx(map.sand.w), sx(map.sand.h)]} />
          <meshStandardMaterial color="#c9a56a" roughness={0.9} />
        </mesh>
      ) : null}
      {map.parks.map((park, index) => (
        <mesh
          key={`park-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(park.x + park.w / 2), 0.02, sx(park.y + park.h / 2)]}
        >
          <planeGeometry args={[sx(park.w), sx(park.h)]} />
          <meshStandardMaterial color="#245c36" />
        </mesh>
      ))}
      {map.lots.map((lot, index) => (
        <ParkingLot key={`lot-${index}`} lot={lot} />
      ))}
      {map.roads.map((road, index) => {
        const horiz = road.w > road.h
        const hayarkonRoad = road.name === "hayarkon"
        return (
          <group key={`road-${index}`}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[sx(road.x + road.w / 2), 0.03, sx(road.y + road.h / 2)]}
              receiveShadow
            >
              <planeGeometry args={[sx(road.w), sx(road.h)]} />
              <meshStandardMaterial
                color={hayarkonRoad ? "#6a6b74" : "#73747c"}
                roughness={0.9}
                metalness={0.04}
              />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[sx(road.x + road.w / 2), 0.045, sx(road.y + road.h / 2)]}
            >
              <planeGeometry args={horiz ? [sx(road.w) * 0.92, 0.1] : [0.1, sx(road.h) * 0.92]} />
              <meshStandardMaterial color="#d6c27a" />
            </mesh>
            {!E2E && hayarkonRoad ? <HayarkonCurb road={road} /> : null}
          </group>
        )
      })}
      {map.buildings.map((building, index) => {
        const h = buildingHeight(building.label, index)
        const pos = to3(building.x + building.w / 2, building.y + building.h / 2, h / 2)
        return (
          <group key={`b-${index}`} position={pos}>
            <mesh>
              <boxGeometry args={[sx(building.w), h, sx(building.h)]} />
              <meshStandardMaterial color={building.fill} roughness={0.82} />
            </mesh>
            <mesh position={[0, h / 2 + 0.12, 0]}>
              <boxGeometry args={[sx(building.w) * 0.96, 0.24, sx(building.h) * 0.96]} />
              <meshStandardMaterial color={building.roof ?? "#7f1d1d"} />
            </mesh>
            {building.label ? (
              <group position={[0, 1.1, sx(building.h) / 2 + 0.08]}>
                <PlaceSign text={building.label} width={Math.min(5.2, sx(building.w) * 0.62)} />
              </group>
            ) : null}
          </group>
        )
      })}
      {E2E
        ? null
        : map.parked.map((car, index) => <ParkedMesh key={`parked-${index}`} car={car} />)}
      {E2E ? null : palms.slice(0, 4).map((palm, index) => <Palm key={`palm-${index}`} x={palm.x} z={palm.z} />)}
      {ramzors.map((light) => (
        <group key={light.id}>
          {E2E ? null : <Crosswalk stop={light.stop} />}
          <RamzorMesh ramzor={light} live={live} />
        </group>
      ))}
    </group>
  )
}

function Crosswalk({ stop }: { stop: { x: number; y: number; w: number; h: number } }) {
  const stripes = 5
  return (
    <group>
      {Array.from({ length: stripes }, (_, index) => {
        const z = sx(stop.y + stop.h + 8 + index * 7)
        return (
          <mesh
            key={index}
            position={[sx(stop.x + stop.w / 2), 0.055, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[sx(stop.w) * 0.72, sx(3.2)]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
        )
      })}
    </group>
  )
}

function RamzorMesh({
  ramzor,
  live,
}: {
  ramzor: Ramzor
  live: MutableRefObject<LiveWorld>
}) {
  const red = useRef<Mesh>(null)
  const yellow = useRef<Mesh>(null)
  const green = useRef<Mesh>(null)
  const glow = useRef<Mesh>(null)
  useFrame(() => {
    const hold = live.current.ramzorHold
    const signal = ramzorSignal(performance.now(), ramzor.index, hold)
    paintBulb(red.current, signal === "red", "#ff2a2a", "#4a1010")
    paintBulb(yellow.current, signal === "yellow", "#ffe14a", "#5a3b00")
    paintBulb(green.current, signal === "green", "#3dff7a", "#0d3d22")
    if (glow.current) {
      const color = signal === "red" ? "#ff2a2a" : signal === "yellow" ? "#ffe14a" : "#3dff7a"
      const material = glow.current.material as MeshStandardMaterial
      material.color.set(color)
      glow.current.position.y = signal === "red" ? 5.12 : signal === "yellow" ? 4.62 : 4.12
    }
  })
  const [x, , z] = to3(ramzor.x, ramzor.y)
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 4.7, 6]} />
        <meshStandardMaterial color="#1f2937" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[-0.32, 4.62, 0]}>
        <boxGeometry args={[0.42, 1.55, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh ref={red} position={[-0.56, 5.12, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#4a1010" />
      </mesh>
      <mesh ref={yellow} position={[-0.56, 4.62, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#5a3b00" />
      </mesh>
      <mesh ref={green} position={[-0.56, 4.12, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#0d3d22" />
      </mesh>
      <mesh ref={glow} position={[-0.56, 5.12, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshBasicMaterial color="#ff2a2a" transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

function paintBulb(mesh: Mesh | null, on: boolean, lit: string, dim: string) {
  if (!mesh) return
  const material = mesh.material as MeshStandardMaterial
  material.color.set(on ? lit : dim)
}

function HayarkonCurb({ road }: { road: { x: number; y: number; w: number; h: number } }) {
  const stripes: ReactNode[] = []
  for (let i = 0; i < 14; i++) {
    const z = sx(road.y + 24 + i * 148)
    const color = i % 2 === 0 ? "#2563eb" : "#f8fafc"
    stripes.push(
      <mesh key={`c-${i}`} position={[sx(road.x + 2.4), 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, sx(28)]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  return <group>{stripes}</group>
}

function ParkingLot({ lot }: { lot: { x: number; y: number; w: number; h: number } }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[sx(lot.x + lot.w / 2), 0.025, sx(lot.y + lot.h / 2)]}
        receiveShadow
      >
        <planeGeometry args={[sx(lot.w), sx(lot.h)]} />
        <meshStandardMaterial color="#8a8b92" roughness={0.92} metalness={0.02} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(lot.x + 40 + i * ((lot.w - 80) / 3)), 0.04, sx(lot.y + lot.h / 2)]}
        >
          <planeGeometry args={[0.08, sx(lot.h) * 0.7]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      ))}
    </group>
  )
}

function PlaceSign({ text, width }: { text: string; width: number }) {
  const texture = useMemo(() => makeSignTexture(text), [text])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh>
      <planeGeometry args={[width, width * 0.28]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  )
}

function makeSignTexture(text: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return new CanvasTexture(canvas)
  ctx.fillStyle = "#f3ead8"
  ctx.fillRect(0, 0, 512, 128)
  ctx.strokeStyle = "#c4b49a"
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, 504, 120)
  ctx.direction = "rtl"
  ctx.fillStyle = "#3f3a32"
  ctx.font = "700 56px Rubik, Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 256, 68)
  const tex = new CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function Palm({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.18, 3.4, 6]} />
        <meshStandardMaterial color="#6b3f24" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i) * 0.55, 3.45, Math.sin(i) * 0.55]}
          rotation={[0.7, i, 0]}
        >
          <coneGeometry args={[0.32, 1.05, 4]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      ))}
    </group>
  )
}

function ParkedMesh({ car }: { car: ParkedCar }) {
  const [x, , z] = to3(car.x, car.y)
  return (
    <group position={[x, 0, z]} rotation={[0, -car.facing + Math.PI / 2, 0]}>
      <Car color={car.color} taxi={car.taxi} />
    </group>
  )
}

function FollowCamera({ live }: { live: MutableRefObject<LiveWorld> }) {
  useFrame((state, dt) => {
    const world = live.current
    const [px, , pz] = to3(world.x, world.y)
    const cafe = world.interior === "cafe"
    const back = cafe ? 5.2 : world.driving ? 12 : 8.2
    const height = cafe ? 2.8 : world.driving ? 5.6 : 5.1
    const yaw = world.facing
    const side = cafe ? 0.2 : world.driving ? 0.4 : 0.25
    CAM.set(
      px - Math.cos(yaw) * back + Math.cos(yaw + Math.PI / 2) * side,
      height,
      pz - Math.sin(yaw) * back + Math.sin(yaw + Math.PI / 2) * side
    )
    const k = 1 - Math.exp(-dt * 7.2)
    state.camera.position.lerp(CAM, k)
    LOOK.set(px + Math.cos(yaw) * (cafe ? 2.2 : 3.6), cafe ? 1.2 : world.driving ? 1.15 : 1.4, pz + Math.sin(yaw) * (cafe ? 2.2 : 3.6))
    state.camera.lookAt(LOOK)
  })
  return null
}

function Player({
  live,
  gender,
  driving,
  taxiRide,
}: {
  live: MutableRefObject<LiveWorld>
  gender: "male" | "female"
  driving: boolean
  taxiRide: boolean
}) {
  const group = useRef<Group>(null)
  useFrame((_, dt) => {
    const node = group.current
    if (!node) return
    const world = live.current
    const [x, , z] = to3(world.x, world.y)
    node.position.set(x, 0, z)
    const yaw = -world.facing + Math.PI / 2
    node.rotation.y = MathUtils.damp(node.rotation.y, yaw, 12, dt)
  })
  return (
    <group ref={group}>
      <PlayerBody live={live} gender={gender} driving={driving} taxiRide={taxiRide} />
    </group>
  )
}

function PlayerBody({
  live,
  gender,
  driving,
  taxiRide,
}: {
  live: MutableRefObject<LiveWorld>
  gender: "male" | "female"
  driving: boolean
  taxiRide: boolean
}) {
  const leftLeg = useRef<Mesh>(null)
  const rightLeg = useRef<Mesh>(null)
  const leftArm = useRef<Mesh>(null)
  const rightArm = useRef<Mesh>(null)
  useFrame((state) => {
    const world = live.current
    const swing = world.moving && !world.driving ? Math.sin(state.clock.elapsedTime * 9) : 0
    if (leftLeg.current) leftLeg.current.rotation.x = swing * 0.7
    if (rightLeg.current) rightLeg.current.rotation.x = -swing * 0.7
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.55
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.55
  })
  const shirt = gender === "female" ? "#fb7185" : "#22d3ee"
  const skin = gender === "female" ? "#f1c7b0" : "#e8c39e"
  if (driving) {
    return <Car color={taxiRide ? "#f5c518" : "#1e293b"} taxi={taxiRide} />
  }
  return (
    <group>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} />
      </mesh>
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 1.55, 0.2]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.42, 6, 12]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh ref={leftArm} position={[-0.34, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.32, 4, 8]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh ref={rightArm} position={[0.34, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.32, 4, 8]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh ref={leftLeg} position={[-0.12, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.46, 4, 8]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <mesh ref={rightLeg} position={[0.12, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.46, 4, 8]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
    </group>
  )
}

function Car({ color, taxi }: { color: string; taxi?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.15, 0.42, 2.15]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.78, -0.12]} castShadow>
        <boxGeometry args={[0.95, 0.42, 1.15]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.42} metalness={0.6} roughness={0.12} />
      </mesh>
      {([-0.38, 0.38] as const).map((x) => (
        <mesh key={`h-${x}`} position={[x, 0.42, 1.08]}>
          <boxGeometry args={[0.18, 0.1, 0.06]} />
          <meshBasicMaterial color="#ffe7b0" />
        </mesh>
      ))}
      {([-0.38, 0.38] as const).map((x) => (
        <mesh key={`t-${x}`} position={[x, 0.42, -1.08]}>
          <boxGeometry args={[0.16, 0.08, 0.05]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
      {([-0.48, 0.48] as const).flatMap((x) =>
        ([-0.7, 0.7] as const).map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.18, 10]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))
      )}
      {taxi ? (
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.4, 0.12, 0.3]} />
          <meshStandardMaterial color="#111" emissive="#facc15" emissiveIntensity={0.8} />
        </mesh>
      ) : null}
    </group>
  )
}

function Crowd({ live }: { live: MutableRefObject<LiveWorld> }) {
  const group = useRef<Group>(null)
  const snapshot = live.current.actors
  useFrame(() => {
    const root = group.current
    if (!root) return
    const actors = live.current.actors
    for (let i = 0; i < root.children.length; i++) {
      const actor = actors[i]
      const child = root.children[i]
      if (!actor || !child) continue
      const [x, , z] = to3(actor.x, actor.y)
      child.position.set(x, 0, z)
      if (actor.vx || actor.vy) {
        child.rotation.y = -Math.atan2(actor.vy, actor.vx) + Math.PI / 2
      }
    }
  })
  return (
    <group ref={group}>
      {snapshot.map((actor) => (
        <ActorMesh key={actor.id} actor={actor} />
      ))}
    </group>
  )
}

function ActorMesh({ actor }: { actor: LiveActor }) {
  if (actor.kind === "car") {
    return (
      <group>
        <Car color={actor.color} />
      </group>
    )
  }
  const shirt = actor.kind === "cop" ? "#1d4ed8" : actor.color
  const skin = actor.kind === "cop" ? "#f0d5b8" : "#e8c39e"
  return (
    <group>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.36, 4, 8]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <capsuleGeometry args={[0.08, 0.38, 4, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

function Landmarks({
  map,
  live,
}: {
  map: WorldMap
  live: MutableRefObject<LiveWorld>
}) {
  return (
    <group>
      {map.landmarks.map((landmark) => (
        <LandmarkMarker key={landmark.id} landmark={landmark} live={live} />
      ))}
    </group>
  )
}

function LandmarkMarker({
  landmark,
  live,
}: {
  landmark: Landmark
  live: MutableRefObject<LiveWorld>
}) {
  const glow = useRef<Mesh>(null)
  const parked = useRef<Group>(null)
  useFrame(() => {
    if (glow.current) glow.current.visible = live.current.nextId === landmark.missionId
    if (parked.current) parked.current.visible = !live.current.taxiRide
  })
  const [x, , z] = to3(landmark.x, landmark.y)
  const isTaxi = landmark.id === "taxi"
  const npcColor = new Color(landmark.color)
  return (
    <group position={[x, 0, z]}>
      {isTaxi ? (
        <group ref={parked} position={[1.6, 0, 0]}>
          <Car color="#f5c518" taxi />
        </group>
      ) : (
        <group>
          <mesh position={[0, 1.45, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#f1c7b0" />
          </mesh>
          <mesh position={[0, 0.98, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.4, 4, 10]} />
            <meshStandardMaterial color={npcColor} />
          </mesh>
        </group>
      )}
      <mesh ref={glow} position={[0, 3.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.55, 8]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
    </group>
  )
}
