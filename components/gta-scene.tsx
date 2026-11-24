"use client"

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Color, MathUtils, Vector3 } from "three"

import {
  buildingHeight,
  sx,
  to3,
  type LiveActor,
  type LiveWorld,
} from "@/lib/world3d"
import { Maggie } from "@/components/maggie"
import type { Landmark, WorldMap } from "@/lib/world"

const LOOK = new Vector3()
const CAM = new Vector3()

export function GtaScene({
  map,
  live,
  gender,
  driving,
  taxiRide,
}: {
  map: WorldMap
  live: MutableRefObject<LiveWorld>
  gender: "male" | "female"
  driving: boolean
  taxiRide: boolean
}) {
  return (
    <>
      <color attach="background" args={["#7ec8e3"]} />
      <fog attach="fog" args={["#9ad0e6", 70, 240]} />
      <hemisphereLight args={["#fff1d6", "#3f6b46", 0.95]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[60, 80, 40]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={220}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      <City map={map} />
      <Crowd live={live} />
      <Player live={live} gender={gender} driving={driving} taxiRide={taxiRide} />
      <Maggie live={live} />
      <Landmarks map={map} live={live} />
      <FollowCamera live={live} />
    </>
  )
}

function City({ map }: { map: WorldMap }) {
  const extent = useMemo(() => ({ w: sx(map.w), d: sx(map.h) }), [map.h, map.w])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[extent.w / 2, -0.02, extent.d / 2]} receiveShadow>
        <planeGeometry args={[extent.w + 40, extent.d + 40]} />
        <meshStandardMaterial color="#3a7a4a" />
      </mesh>
      {map.sea ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(map.sea.x + map.sea.w / 2), -0.04, sx(map.sea.y + map.sea.h / 2)]}
        >
          <planeGeometry args={[sx(map.sea.w), sx(map.sea.h)]} />
          <meshStandardMaterial color="#1d6aa5" roughness={0.25} metalness={0.2} />
        </mesh>
      ) : null}
      {map.sand ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(map.sand.x + map.sand.w / 2), 0.01, sx(map.sand.y + map.sand.h / 2)]}
        >
          <planeGeometry args={[sx(map.sand.w), sx(map.sand.h)]} />
          <meshStandardMaterial color="#e4c68a" />
        </mesh>
      ) : null}
      {map.parks.map((park, index) => (
        <mesh
          key={`park-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[sx(park.x + park.w / 2), 0.02, sx(park.y + park.h / 2)]}
        >
          <planeGeometry args={[sx(park.w), sx(park.h)]} />
          <meshStandardMaterial color="#4f9a5c" />
        </mesh>
      ))}
      {map.roads.map((road, index) => {
        const horiz = road.w > road.h
        return (
          <group key={`road-${index}`}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[sx(road.x + road.w / 2), 0.03, sx(road.y + road.h / 2)]}
              receiveShadow
            >
              <planeGeometry args={[sx(road.w), sx(road.h)]} />
              <meshStandardMaterial color="#3f3f46" />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[sx(road.x + road.w / 2), 0.04, sx(road.y + road.h / 2)]}
            >
              <planeGeometry args={horiz ? [sx(road.w) * 0.92, 0.12] : [0.12, sx(road.h) * 0.92]} />
              <meshStandardMaterial color="#f5c518" />
            </mesh>
          </group>
        )
      })}
      {map.buildings.map((building, index) => {
        const h = buildingHeight(building.label, index)
        const pos = to3(building.x + building.w / 2, building.y + building.h / 2, h / 2)
        return (
          <group key={`b-${index}`} position={pos}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[sx(building.w), h, sx(building.h)]} />
              <meshStandardMaterial color={building.fill} roughness={0.78} />
            </mesh>
            <mesh position={[0, h / 2 + 0.12, 0]}>
              <boxGeometry args={[sx(building.w) * 0.96, 0.24, sx(building.h) * 0.96]} />
              <meshStandardMaterial color={building.roof ?? "#7f1d1d"} />
            </mesh>
            <Windows width={sx(building.w)} depth={sx(building.h)} height={h} />
          </group>
        )
      })}
    </group>
  )
}

function Windows({ width, depth, height }: { width: number; depth: number; height: number }) {
  const rows = Math.max(2, Math.floor(height / 2.4))
  const colsW = Math.min(5, Math.max(2, Math.floor(width / 2.8)))
  const panes: ReactNode[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colsW; c++) {
      const y = -height / 2 + 1.4 + r * 2.1
      const x = -width / 2 + 1.2 + c * ((width - 2.4) / Math.max(1, colsW - 1))
      panes.push(
        <mesh key={`s-${r}-${c}`} position={[x, y, depth / 2 + 0.03]}>
          <boxGeometry args={[0.7, 0.9, 0.04]} />
          <meshStandardMaterial
            color="#93c5fd"
            emissive="#1e3a5f"
            emissiveIntensity={0.25}
            roughness={0.2}
          />
        </mesh>
      )
    }
  }
  return <group>{panes}</group>
}

function FollowCamera({ live }: { live: MutableRefObject<LiveWorld> }) {
  useFrame((state, dt) => {
    const world = live.current
    const [px, , pz] = to3(world.x, world.y)
    const back = world.driving ? 16 : 9.2
    const height = world.driving ? 8.5 : 5.1
    const yaw = world.facing
    CAM.set(px - Math.cos(yaw) * back, height, pz - Math.sin(yaw) * back)
    const k = 1 - Math.exp(-dt * 5.5)
    state.camera.position.lerp(CAM, k)
    LOOK.set(px + Math.cos(yaw) * 3.2, world.driving ? 1.4 : 1.55, pz + Math.sin(yaw) * 3.2)
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
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.78, -0.12]} castShadow>
        <boxGeometry args={[0.95, 0.42, 1.15]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.55} />
      </mesh>
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
          <meshStandardMaterial color="#111" />
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
  useFrame((state) => {
    if (glow.current) {
      const isNext = live.current.nextId === landmark.missionId
      glow.current.visible = isNext
      if (isNext) {
        glow.current.position.y = 3.4 + Math.sin(state.clock.elapsedTime * 4) * 0.28
      }
    }
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
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}
