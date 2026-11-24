"use client"

import { useRef, type MutableRefObject, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { MathUtils } from "three"

import { to3, type LiveWorld } from "@/lib/world3d"

const COAT = "#1c1c1c"
const SKIRT = "#242424"
const BEARD = "#5c5752"
const COLLAR = "#d17b76"
const EYE = "#c4783a"
const PUPIL = "#1a1008"
const NOSE = "#050505"

export function Maggie({ live }: { live: MutableRefObject<LiveWorld> }) {
  const group = useRef<Group>(null)
  const spine = useRef<Group>(null)
  const head = useRef<Group>(null)
  const tail = useRef<Mesh>(null)
  const fl = useRef<Mesh>(null)
  const fr = useRef<Mesh>(null)
  const bl = useRef<Mesh>(null)
  const br = useRef<Mesh>(null)
  const gait = useRef(0)
  const wag = useRef(0)

  useFrame((_, dt) => {
    const node = group.current
    if (!node) return
    const world = live.current
    const [x, , z] = to3(world.maggieX, world.maggieY)
    const lift = world.driving ? 0.62 : 0
    node.position.x = x
    node.position.z = z
    node.position.y = MathUtils.damp(node.position.y, lift, 8, dt)
    const yaw = -world.maggieFacing + Math.PI / 2
    node.rotation.y = MathUtils.damp(node.rotation.y, yaw, 6, dt)

    const sitting = world.maggieSitting && !world.driving
    const trotting = world.maggieMoving && !world.driving && !sitting
    if (trotting) gait.current += dt * 6.4
    else gait.current = MathUtils.damp(gait.current, Math.round(gait.current / Math.PI) * Math.PI, 8, dt)

    const step = Math.sin(gait.current)
    const stride = trotting ? step : 0
    if (fl.current) {
      fl.current.rotation.x = MathUtils.damp(fl.current.rotation.x, stride * 0.55, 14, dt)
      fl.current.position.y = 0.1 + (trotting ? Math.max(0, stride) * 0.05 : 0)
      fl.current.position.z = 0.15 + stride * 0.07
    }
    if (fr.current) {
      fr.current.rotation.x = MathUtils.damp(fr.current.rotation.x, -stride * 0.55, 14, dt)
      fr.current.position.y = 0.1 + (trotting ? Math.max(0, -stride) * 0.05 : 0)
      fr.current.position.z = 0.15 - stride * 0.07
    }
    if (bl.current) {
      const sitRear = sitting ? 0.95 : -stride * 0.5
      bl.current.rotation.x = MathUtils.damp(bl.current.rotation.x, sitRear, 8, dt)
      bl.current.position.y = MathUtils.damp(bl.current.position.y, sitting ? 0.08 : 0.1, 8, dt)
      bl.current.position.z = sitting ? -0.14 : -0.18 - stride * 0.07
    }
    if (br.current) {
      const sitRear = sitting ? 0.95 : stride * 0.5
      br.current.rotation.x = MathUtils.damp(br.current.rotation.x, sitRear, 8, dt)
      br.current.position.y = MathUtils.damp(br.current.position.y, sitting ? 0.08 : 0.1, 8, dt)
      br.current.position.z = sitting ? -0.14 : -0.18 + stride * 0.07
    }

    if (spine.current) {
      spine.current.rotation.x = MathUtils.damp(spine.current.rotation.x, sitting ? 0.18 : 0, 7, dt)
      spine.current.rotation.z = trotting ? stride * 0.1 : 0
      spine.current.position.y = MathUtils.damp(
        spine.current.position.y,
        sitting ? -0.04 : trotting ? Math.abs(stride) * 0.03 : 0,
        8,
        dt
      )
    }
    if (head.current) {
      const look = sitting ? -0.38 : -0.18
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, look, 7, dt)
      head.current.rotation.y = MathUtils.damp(head.current.rotation.y, sitting ? 0.5 : 0.08, 6, dt)
    }
    if (tail.current) {
      wag.current += dt * (sitting ? 2.8 : 5.2)
      tail.current.rotation.z = Math.sin(wag.current) * (sitting ? 0.14 : 0.1)
    }
  })

  const spawn = to3(live.current.maggieX, live.current.maggieY)
  return (
    <group ref={group} scale={1.55} position={spawn}>
      <Scottie
        spine={spine}
        head={head}
        tail={tail}
        fl={fl}
        fr={fr}
        bl={bl}
        br={br}
      />
    </group>
  )
}

function Scottie({
  spine,
  head,
  tail,
  fl,
  fr,
  bl,
  br,
}: {
  spine: RefObject<Group | null>
  head: RefObject<Group | null>
  tail: RefObject<Mesh | null>
  fl: RefObject<Mesh | null>
  fr: RefObject<Mesh | null>
  bl: RefObject<Mesh | null>
  br: RefObject<Mesh | null>
}) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} />
      </mesh>

      <group ref={spine}>
        <mesh position={[0, 0.22, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.105, 0.24, 4, 8]} />
          <meshStandardMaterial color={COAT} roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.22, 0.12]} rotation={[0.08, 0, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color={COAT} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.12, 0.18, 3, 8]} />
          <meshStandardMaterial color={SKIRT} roughness={1} />
        </mesh>
        <mesh position={[0, 0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.022, 8, 16]} />
          <meshStandardMaterial color={COLLAR} roughness={0.5} />
        </mesh>
        <mesh ref={tail} position={[0, 0.36, -0.22]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.04, 0.16, 6]} />
          <meshStandardMaterial color={COAT} roughness={0.9} />
        </mesh>

        <group ref={head} position={[0, 0.38, 0.26]}>
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.145, 12, 10]} />
            <meshStandardMaterial color={COAT} roughness={0.88} />
          </mesh>
          <mesh position={[0, -0.01, 0.12]}>
            <boxGeometry args={[0.16, 0.12, 0.16]} />
            <meshStandardMaterial color={COAT} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.08, 0.14]}>
            <boxGeometry args={[0.2, 0.14, 0.16]} />
            <meshStandardMaterial color={BEARD} roughness={1} />
          </mesh>
          <mesh position={[0, -0.1, 0.08]}>
            <boxGeometry args={[0.22, 0.12, 0.12]} />
            <meshStandardMaterial color={BEARD} roughness={1} />
          </mesh>
          <mesh position={[-0.1, -0.04, 0.08]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={BEARD} roughness={1} />
          </mesh>
          <mesh position={[0.1, -0.04, 0.08]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={BEARD} roughness={1} />
          </mesh>
          <mesh position={[0, 0.0, 0.2]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color={NOSE} roughness={0.35} />
          </mesh>
          <Eye x={-0.05} />
          <Eye x={0.05} />
          <mesh position={[-0.075, 0.2, -0.02]} rotation={[0.12, 0.06, -0.28]}>
            <coneGeometry args={[0.048, 0.24, 5]} />
            <meshStandardMaterial color={COAT} roughness={0.88} />
          </mesh>
          <mesh position={[0.075, 0.2, -0.02]} rotation={[0.12, -0.06, 0.28]}>
            <coneGeometry args={[0.048, 0.24, 5]} />
            <meshStandardMaterial color={COAT} roughness={0.88} />
          </mesh>
        </group>
      </group>

      <mesh ref={fl} position={[-0.1, 0.1, 0.15]}>
        <capsuleGeometry args={[0.038, 0.1, 3, 6]} />
        <meshStandardMaterial color={COAT} roughness={0.95} />
      </mesh>
      <mesh ref={fr} position={[0.1, 0.1, 0.15]}>
        <capsuleGeometry args={[0.038, 0.1, 3, 6]} />
        <meshStandardMaterial color={COAT} roughness={0.95} />
      </mesh>
      <mesh ref={bl} position={[-0.1, 0.1, -0.18]}>
        <capsuleGeometry args={[0.04, 0.1, 3, 6]} />
        <meshStandardMaterial color={COAT} roughness={0.95} />
      </mesh>
      <mesh ref={br} position={[0.1, 0.1, -0.18]}>
        <capsuleGeometry args={[0.04, 0.1, 3, 6]} />
        <meshStandardMaterial color={COAT} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Eye({ x }: { x: number }) {
  return (
    <group position={[x, 0.04, 0.1]}>
      <mesh>
        <sphereGeometry args={[0.032, 8, 6]} />
        <meshStandardMaterial color={EYE} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <sphereGeometry args={[0.014, 6, 6]} />
        <meshStandardMaterial color={PUPIL} roughness={0.2} />
      </mesh>
    </group>
  )
}
