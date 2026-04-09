'use client'

import { useRef, useMemo, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import { getPlayersForYear, getAllYears } from '@/lib/draft-config'
import { getPositionColor } from '@/lib/utils/format'
import type { Player } from '@/types'

// ---------------------------------------------------------------------------
// Position filter config
// ---------------------------------------------------------------------------
const POSITION_FILTERS = [
  'ALL',
  'QB',
  'RB',
  'WR',
  'TE',
  'OL',
  'DL',
  'EDGE',
  'LB',
  'CB',
  'S',
] as const
type PosFilter = (typeof POSITION_FILTERS)[number]

function matchesFilter(position: string, filter: PosFilter): boolean {
  if (filter === 'ALL') return true
  if (filter === 'OL') return position === 'OT' || position === 'IOL'
  return position === filter
}

// ---------------------------------------------------------------------------
// Position-average defaults for missing measurables
// ---------------------------------------------------------------------------
interface Measurables {
  forty_yard: number
  height_inches: number
  weight_lbs: number
  vertical_jump: number
  broad_jump: number
}

function computePositionDefaults(players: Player[]): Record<string, Measurables> {
  const accum: Record<string, { sums: Measurables; counts: Measurables }> = {}

  for (const p of players) {
    if (!accum[p.position]) {
      accum[p.position] = {
        sums: { forty_yard: 0, height_inches: 0, weight_lbs: 0, vertical_jump: 0, broad_jump: 0 },
        counts: {
          forty_yard: 0,
          height_inches: 0,
          weight_lbs: 0,
          vertical_jump: 0,
          broad_jump: 0,
        },
      }
    }
    const a = accum[p.position]
    if (p.forty_yard != null) {
      a.sums.forty_yard += p.forty_yard
      a.counts.forty_yard++
    }
    if (p.height_inches != null) {
      a.sums.height_inches += p.height_inches
      a.counts.height_inches++
    }
    if (p.weight_lbs != null) {
      a.sums.weight_lbs += p.weight_lbs
      a.counts.weight_lbs++
    }
    if (p.vertical_jump != null) {
      a.sums.vertical_jump += p.vertical_jump
      a.counts.vertical_jump++
    }
    if (p.broad_jump != null) {
      a.sums.broad_jump += p.broad_jump
      a.counts.broad_jump++
    }
  }

  const defaults: Record<string, Measurables> = {}
  for (const [pos, { sums, counts }] of Object.entries(accum)) {
    defaults[pos] = {
      forty_yard: counts.forty_yard > 0 ? sums.forty_yard / counts.forty_yard : 4.6,
      height_inches: counts.height_inches > 0 ? sums.height_inches / counts.height_inches : 73,
      weight_lbs: counts.weight_lbs > 0 ? sums.weight_lbs / counts.weight_lbs : 230,
      vertical_jump: counts.vertical_jump > 0 ? sums.vertical_jump / counts.vertical_jump : 33,
      broad_jump: counts.broad_jump > 0 ? sums.broad_jump / counts.broad_jump : 115,
    }
  }
  return defaults
}

// ---------------------------------------------------------------------------
// Normalize value to 0-1 range
// ---------------------------------------------------------------------------
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return (value - min) / (max - min)
}

// ---------------------------------------------------------------------------
// Compute 3D positions for each prospect
// ---------------------------------------------------------------------------
interface ProspectPoint {
  player: Player
  position: THREE.Vector3
  color: THREE.Color
  size: number
}

function buildPoints(players: Player[]): ProspectPoint[] {
  const defaults = computePositionDefaults(players)

  const fallback: Measurables = {
    forty_yard: 4.6,
    height_inches: 73,
    weight_lbs: 230,
    vertical_jump: 33,
    broad_jump: 115,
  }

  // Get resolved measurables for each player
  const resolved = players.map((p) => {
    const d = defaults[p.position] ?? fallback
    return {
      forty_yard: p.forty_yard ?? d.forty_yard,
      height_inches: p.height_inches ?? d.height_inches,
      weight_lbs: p.weight_lbs ?? d.weight_lbs,
      vertical_jump: p.vertical_jump ?? d.vertical_jump,
      broad_jump: p.broad_jump ?? d.broad_jump,
    }
  })

  // Find min/max for normalization
  const mins = {
    forty_yard: Infinity,
    height_inches: Infinity,
    weight_lbs: Infinity,
    vertical_jump: Infinity,
    broad_jump: Infinity,
  }
  const maxs = {
    forty_yard: -Infinity,
    height_inches: -Infinity,
    weight_lbs: -Infinity,
    vertical_jump: -Infinity,
    broad_jump: -Infinity,
  }

  for (const r of resolved) {
    for (const key of Object.keys(mins) as (keyof Measurables)[]) {
      if (r[key] < mins[key]) mins[key] = r[key]
      if (r[key] > maxs[key]) maxs[key] = r[key]
    }
  }

  const SPREAD = 12
  const JITTER = 0.4

  // Deterministic seeded random per player slug
  function seededRandom(seed: string): () => number {
    let h = 0
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i)
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
      h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
      h = (h ^ (h >>> 16)) >>> 0
      return (h / 0xffffffff) * 2 - 1
    }
  }

  return players.map((player, i) => {
    const r = resolved[i]
    const rng = seededRandom(player.slug)

    // X = speed (invert forty — lower is faster)
    const speed = 1 - normalize(r.forty_yard, mins.forty_yard, maxs.forty_yard)
    // Y = size composite
    const size =
      (normalize(r.height_inches, mins.height_inches, maxs.height_inches) +
        normalize(r.weight_lbs, mins.weight_lbs, maxs.weight_lbs)) /
      2
    // Z = explosiveness composite
    const explosive =
      (normalize(r.vertical_jump, mins.vertical_jump, maxs.vertical_jump) +
        normalize(r.broad_jump, mins.broad_jump, maxs.broad_jump)) /
      2

    const x = (speed - 0.5) * SPREAD + rng() * JITTER
    const y = (size - 0.5) * SPREAD + rng() * JITTER
    const z = (explosive - 0.5) * SPREAD + rng() * JITTER

    const rank = player.big_board_rank ?? 50
    // Scale: rank 1 => 0.35, rank 60 => 0.1
    const pointSize = THREE.MathUtils.lerp(0.35, 0.1, Math.min((rank - 1) / 59, 1))

    return {
      player,
      position: new THREE.Vector3(x, y, z),
      color: new THREE.Color(getPositionColor(player.position)),
      size: pointSize,
    }
  })
}

// ---------------------------------------------------------------------------
// Background star field
// ---------------------------------------------------------------------------
function Starfield({ count = 800 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return arr
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#334155" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

// ---------------------------------------------------------------------------
// Instanced prospect spheres
// ---------------------------------------------------------------------------
interface ProspectCloudProps {
  points: ProspectPoint[]
  onHover: (point: ProspectPoint | null) => void
  onClick: (point: ProspectPoint) => void
}

function ProspectCloud({ points, onHover, onClick }: ProspectCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const tempObj = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Update instance matrices and colors
  useMemo(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current

    for (let i = 0; i < points.length; i++) {
      const pt = points[i]
      tempObj.position.copy(pt.position)
      tempObj.scale.setScalar(pt.size)
      tempObj.updateMatrix()
      mesh.setMatrixAt(i, tempObj.matrix)
      mesh.setColorAt(i, tempColor.copy(pt.color))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [points, tempObj, tempColor])

  // Slow rotation for ambiance
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.015
    }
  })

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.instanceId != null && e.instanceId < points.length) {
        onHover(points[e.instanceId])
        document.body.style.cursor = 'pointer'
      }
    },
    [points, onHover],
  )

  const handlePointerOut = useCallback(() => {
    onHover(null)
    document.body.style.cursor = 'default'
  }, [onHover])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.instanceId != null && e.instanceId < points.length) {
        onClick(points[e.instanceId])
      }
    },
    [points, onClick],
  )

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, points.length]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// Floating label that follows hovered prospect
// ---------------------------------------------------------------------------
interface HoverLabelProps {
  point: ProspectPoint | null
}

function HoverLabel({ point }: HoverLabelProps) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current && point) {
      groupRef.current.position.copy(point.position)
      groupRef.current.position.y += point.size + 0.5
      groupRef.current.quaternion.copy(camera.quaternion)
    }
  })

  if (!point) return null

  const label = `${point.player.first_name} ${point.player.last_name}`
  const sub = `${point.player.position} // ${point.player.school}`

  return (
    <group ref={groupRef}>
      <Text
        fontSize={0.3}
        color="#00f0ff"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
      <Text
        fontSize={0.18}
        color="#71717a"
        anchorX="center"
        anchorY="top"
        position={[0, -0.08, 0]}
        font={undefined}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {sub}
      </Text>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene contents (inside Canvas)
// ---------------------------------------------------------------------------
interface SceneProps {
  points: ProspectPoint[]
}

function Scene({ points }: SceneProps) {
  const [hovered, setHovered] = useState<ProspectPoint | null>(null)
  const router = useRouter()

  const handleClick = useCallback(
    (point: ProspectPoint) => {
      router.push(`/players/${point.player.slug}`)
    },
    [router],
  )

  return (
    <>
      <ambientLight intensity={0.3} />
      <Starfield />
      <ProspectCloud points={points} onHover={setHovered} onClick={handleClick} />
      <HoverLabel point={hovered} />
      <OrbitControls
        enableDamping
        dampingFactor={0.12}
        minDistance={3}
        maxDistance={30}
        rotateSpeed={0.5}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
export function GalaxyView() {
  const years = getAllYears()
  const [year, setYear] = useState(years[0])
  const [filter, setFilter] = useState<PosFilter>('ALL')

  const players = useMemo(() => getPlayersForYear(year), [year])

  const filteredPoints = useMemo(() => {
    const filtered = players.filter((p) => matchesFilter(p.position, filter))
    return buildPoints(filtered)
  }, [players, filter])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full">
      {/* Controls overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 p-4">
        {/* Year toggle */}
        <div className="pointer-events-auto flex gap-1">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`border px-3 py-1 text-[10px] font-bold tracking-widest transition-colors ${
                y === year
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Position filters */}
        <div className="pointer-events-auto flex flex-wrap justify-center gap-1">
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={`border px-2 py-0.5 text-[10px] font-bold tracking-widest transition-colors ${
                pos === filter
                  ? 'border-cyan bg-cyan/10 text-cyan'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-col gap-1">
        <span className="text-[10px] font-bold tracking-widest text-cyan">
          PROSPECTS: {filteredPoints.length}
        </span>
        <span className="text-[10px] tracking-widest text-zinc-600">
          X=SPEED // Y=SIZE // Z=EXPLOSIVENESS
        </span>
        <span className="text-[10px] tracking-widest text-zinc-600">
          SCROLL=ZOOM // DRAG=ROTATE // CLICK=PROFILE
        </span>
      </div>

      {/* Position legend */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col gap-0.5">
        {(['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'EDGE', 'LB', 'CB', 'S'] as const).map((pos) => (
          <div key={pos} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: pos === 'OL' ? getPositionColor('OT') : getPositionColor(pos),
                boxShadow: `0 0 6px ${pos === 'OL' ? getPositionColor('OT') : getPositionColor(pos)}`,
              }}
            />
            <span className="text-[9px] font-bold tracking-widest text-zinc-500">{pos}</span>
          </div>
        ))}
      </div>

      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-cyan">
                INITIALIZING_GALAXY
              </span>
            </div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 18], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#09090b' }}
          dpr={[1, 2]}
        >
          <Scene points={filteredPoints} />
        </Canvas>
      </Suspense>
    </div>
  )
}
