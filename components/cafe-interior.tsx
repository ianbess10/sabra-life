"use client"

import { sx, to3 } from "@/lib/world3d"
import { CAFE } from "@/lib/interior"

export function CafeInterior() {
  const floorW = sx(CAFE.w)
  const floorD = sx(CAFE.h)
  const counter = CAFE.counter
  return (
    <group>
      <color attach="background" args={["#1a0e14"]} />
      <fog attach="fog" args={["#2a1810", 12, 38]} />
      <hemisphereLight args={["#ffe2c4", "#5c3a28", 1.05]} />
      <ambientLight intensity={0.72} />
      <pointLight position={[sx(80), 4.2, sx(58)]} color="#ffc58a" intensity={3.2} distance={28} />
      <pointLight position={[sx(40), 3.2, sx(30)]} color="#fde68a" intensity={1.8} distance={16} />
      <pointLight position={[sx(130), 3.4, sx(58)]} color="#fff1d6" intensity={2.2} distance={14} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sx(CAFE.w / 2), 0, sx(CAFE.h / 2)]} receiveShadow>
        <planeGeometry args={[floorW + 2, floorD + 2]} />
        <meshStandardMaterial color="#8a5a3e" roughness={0.65} />
      </mesh>

      <Wall x={CAFE.w / 2} z={2} w={CAFE.w} d={4} h={5.2} />
      <Wall x={CAFE.w / 2} z={CAFE.h - 2} w={CAFE.w} d={4} h={5.2} />
      <Wall x={2} z={CAFE.h / 2} w={4} d={CAFE.h} h={5.2} />
      <Wall x={CAFE.w - 2} z={CAFE.h / 2} w={4} d={CAFE.h} h={5.2} />

      <mesh position={to3(counter.x + counter.w / 2, counter.y + counter.h / 2, 0.7)} castShadow>
        <boxGeometry args={[sx(counter.w), 1.4, sx(counter.h)]} />
        <meshStandardMaterial color="#7a4c38" roughness={0.5} />
      </mesh>
      <mesh position={to3(counter.x + counter.w / 2, counter.y + 12, 1.55)}>
        <boxGeometry args={[sx(28), 0.7, sx(16)]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={to3(counter.x + counter.w / 2, counter.y + 12, 1.95)}>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 8]} />
        <meshStandardMaterial color="#d6d3d1" metalness={0.7} />
      </mesh>

      <group position={to3(CAFE.barista.x, CAFE.barista.y)}>
        <mesh position={[0, 1.48, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#e8c39e" />
        </mesh>
        <mesh position={[0, 1, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 4, 10]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>

      {[
        [48, 28],
        [78, 28],
        [48, 88],
        [78, 88],
      ].map(([x, z]) => (
        <Table key={`${x}-${z}`} x={x} z={z} />
      ))}

      <mesh position={to3(CAFE.door.x + 4, CAFE.door.y, 1.6)}>
        <boxGeometry args={[0.12, 3.1, 1.6]} />
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={to3(CAFE.w / 2, 4, 3.6)}>
        <planeGeometry args={[4.6, 1.1]} />
        <meshBasicMaterial color="#fb923c" />
      </mesh>
      <mesh position={[sx(CAFE.w / 2), 2.6, 0.28]}>
        <planeGeometry args={[sx(48), 2.4]} />
        <meshBasicMaterial color="#c45c2a" />
      </mesh>
    </group>
  )
}

function Wall({
  x,
  z,
  w,
  d,
  h,
}: {
  x: number
  z: number
  w: number
  d: number
  h: number
}) {
  return (
    <mesh position={[sx(x), h / 2, sx(z)]}>
      <boxGeometry args={[sx(w), h, sx(d)]} />
      <meshStandardMaterial color="#c48462" roughness={0.78} />
    </mesh>
  )
}

function Table({ x, z }: { x: number; z: number }) {
  return (
    <group position={to3(x, z)}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 12]} />
        <meshStandardMaterial color="#d6b48a" />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.72, 8]} />
        <meshStandardMaterial color="#4a2f24" />
      </mesh>
      <mesh position={[0.7, 0.95, 0.15]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#f1c7b0" />
      </mesh>
      <mesh position={[0.7, 0.55, 0.15]}>
        <capsuleGeometry args={[0.14, 0.28, 4, 8]} />
        <meshStandardMaterial color="#fda4af" />
      </mesh>
    </group>
  )
}
