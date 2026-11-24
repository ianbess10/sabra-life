"use client"

import { useRef, type MutableRefObject, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { MathUtils } from "three"

import { to3, type LiveWorld } from "@/lib/world3d"

const COAT = "#2b2b2b"
const WIRE = "#3a3a3a"
const BEARD = "#8a8a8a"
const COLLAR = "#b91c1c"
const EYE = "#c4a574"
const NOSE = "#050505"

export function Maggie({ live }: { live: MutableRefObject<LiveWorld> }) {
  const group = useRef<Group>(null)
  const tail = useRef<Mesh>(null)
  const fl = useRef<Mesh>(null)
  const fr = useRef<Mesh>(null)
  const bl = useRef<Mesh>(null)
  const br = useRef<Mesh>(null)
  const body = useRef<Group>(null)

  useFrame((state, dt) => {
    const node = group.current
    if (!node) return
    const world = live.current
    const [x, , z] = to3(world.maggieX, world.maggieY)
    const lift = world.driving ? 0.62 : 0
    node.position.x = MathUtils.damp(node.position.x, x, 14, dt)
    node.position.z = MathUtils.damp(node.position.z, z, 14, dt)
    node.position.y = MathUtils.damp(node.position.y, lift, 10, dt)
    const yaw = -world.maggieFacing + Math.PI / 2
    node.rotation.y = MathUtils.damp(node.rotation.y, yaw, 10, dt)

    const t = state.clock.elapsedTime
    const trot = world.maggieMoving && !world.driving && !world.maggieSitting ? Math.sin(t * 13) : 0
    if (fl.current) fl.current.rotation.x = trot * 0.8
    if (fr.current) fr.current.rotation.x = -trot * 0.8
    if (bl.current) bl.current.rotation.x = -trot * 0.6
    if (br.current) br.current.rotation.x = trot * 0.6
    if (tail.current) {
      tail.current.rotation.z = Math.sin(t * (world.maggieSitting ? 8 : 12)) * 0.32
    }
    if (body.current) {
      const sit = world.maggieSitting && !world.driving ? 1 : 0
      body.current.rotation.x = MathUtils.damp(body.current.rotation.x, sit * 0.85, 10, dt)
      body.current.position.y = MathUtils.damp(body.current.position.y, sit * -0.1, 10, dt)
    }
  })

  return (
    <group ref={group} scale={2.15} position={to3(live.current.x - 8, live.current.y + 22)}>
      <pointLight position={[0.35, 0.9, 0.45]} intensity={1.1} distance={2.8} color="#fff4e0" />
      <ScottieBody tail={tail} fl={fl} fr={fr} bl={bl} br={br} body={body} />
    </group>
  )
}

function ScottieBody({
  tail,
  fl,
  fr,
  bl,
  br,
  body,
}: {
  tail: RefObject<Mesh | null>
  fl: RefObject<Mesh | null>
  fr: RefObject<Mesh | null>
  bl: RefObject<Mesh | null>
  br: RefObject<Mesh | null>
  body: RefObject<Group | null>
}) {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
      <group ref={body}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.52]} />
          <meshStandardMaterial color={COAT} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.24, 0.18]} castShadow>
          <boxGeometry args={[0.24, 0.2, 0.18]} />
          <meshStandardMaterial color={COAT} roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.28, 0.34]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color={WIRE} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.025, 8, 16]} />
          <meshStandardMaterial color={COLLAR} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.2, 0.46]} castShadow>
          <boxGeometry args={[0.24, 0.2, 0.16]} />
          <meshStandardMaterial color={BEARD} roughness={1} />
        </mesh>
        <mesh position={[0, 0.1, 0.48]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.12]} />
          <meshStandardMaterial color={BEARD} roughness={1} />
        </mesh>
        <mesh position={[-0.13, 0.2, 0.36]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.14]} />
          <meshStandardMaterial color={BEARD} roughness={1} />
        </mesh>
        <mesh position={[0.13, 0.2, 0.36]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.14]} />
          <meshStandardMaterial color={BEARD} roughness={1} />
        </mesh>
        <mesh position={[0, 0.26, 0.54]}>
          <boxGeometry args={[0.07, 0.06, 0.06]} />
          <meshStandardMaterial color={NOSE} />
        </mesh>
        <mesh position={[-0.06, 0.32, 0.4]}>
          <boxGeometry args={[0.045, 0.04, 0.03]} />
          <meshStandardMaterial color={EYE} />
        </mesh>
        <mesh position={[0.06, 0.32, 0.4]}>
          <boxGeometry args={[0.045, 0.04, 0.03]} />
          <meshStandardMaterial color={EYE} />
        </mesh>
        <mesh position={[-0.065, 0.36, 0.38]}>
          <boxGeometry args={[0.08, 0.04, 0.05]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh position={[0.065, 0.36, 0.38]}>
          <boxGeometry args={[0.08, 0.04, 0.05]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh position={[-0.08, 0.42, 0.3]} rotation={[0.2, 0, -0.28]}>
          <coneGeometry args={[0.05, 0.14, 5]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh position={[0.08, 0.42, 0.3]} rotation={[0.2, 0, 0.28]}>
          <coneGeometry args={[0.05, 0.14, 5]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh ref={tail} position={[0, 0.4, -0.24]}>
          <coneGeometry args={[0.045, 0.22, 6]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh ref={fl} position={[-0.07, 0.08, 0.16]} castShadow>
          <capsuleGeometry args={[0.038, 0.07, 3, 6]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh ref={fr} position={[0.07, 0.08, 0.16]} castShadow>
          <capsuleGeometry args={[0.038, 0.07, 3, 6]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh ref={bl} position={[-0.07, 0.08, -0.16]} castShadow>
          <capsuleGeometry args={[0.038, 0.07, 3, 6]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
        <mesh ref={br} position={[0.07, 0.08, -0.16]} castShadow>
          <capsuleGeometry args={[0.038, 0.07, 3, 6]} />
          <meshStandardMaterial color={COAT} />
        </mesh>
      </group>
    </group>
  )
}
