"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/lib/store";
import { levelFromXP } from "@/lib/xp";
import { initialBosses } from "@/lib/initial-data";
import { computeBossState } from "@/lib/bosses-logic";

type Palette = {
  cloakOuter: string;
  cloakInner: string;
  trim: string;
  glow: string;
  innerLight: string;
};

const PALETTES: Palette[] = [
  // L1-3 violet earth
  {
    cloakOuter: "#3a2e55",
    cloakInner: "#1c1832",
    trim: "#a78bfa",
    glow: "#a78bfa",
    innerLight: "#c4b5fd",
  },
  // L4-6 magenta
  {
    cloakOuter: "#7c2d8a",
    cloakInner: "#3a1a4a",
    trim: "#f472b6",
    glow: "#ec4899",
    innerLight: "#f9a8d4",
  },
  // L7-10 cyan
  {
    cloakOuter: "#1e6f8a",
    cloakInner: "#1a3a4a",
    trim: "#67e8f9",
    glow: "#22d3ee",
    innerLight: "#a5f3fc",
  },
  // L11-15 gold
  {
    cloakOuter: "#8a5a1e",
    cloakInner: "#4a2e1a",
    trim: "#fcd34d",
    glow: "#fbbf24",
    innerLight: "#fef08a",
  },
  // L16-20 emerald
  {
    cloakOuter: "#21794d",
    cloakInner: "#11392a",
    trim: "#86efac",
    glow: "#10b981",
    innerLight: "#a7f3d0",
  },
  // L21-25 cosmic
  {
    cloakOuter: "#6a1e9c",
    cloakInner: "#2d0e4d",
    trim: "#e9d5ff",
    glow: "#c4b5fd",
    innerLight: "#faf5ff",
  },
  // L26-30 pure light
  {
    cloakOuter: "#dadadd",
    cloakInner: "#6e6e80",
    trim: "#fcd34d",
    glow: "#ffffff",
    innerLight: "#ffffff",
  },
];

function paletteForLevel(level: number): Palette {
  if (level >= 26) return PALETTES[6];
  if (level >= 21) return PALETTES[5];
  if (level >= 16) return PALETTES[4];
  if (level >= 11) return PALETTES[3];
  if (level >= 7) return PALETTES[2];
  if (level >= 4) return PALETTES[1];
  return PALETTES[0];
}

function Character({
  palette,
  level,
  hasCrown,
  hasWings,
  hasHalo,
}: {
  palette: Palette;
  level: number;
  hasCrown: boolean;
  hasWings: boolean;
  hasHalo: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // gentle idle bob + breathing rotation
    groupRef.current.position.y = Math.sin(t * 1.1) * 0.06;
    groupRef.current.rotation.y =
      Math.sin(t * 0.4) * 0.18 + Math.sin(t * 0.07) * 0.05;
    // halo slowly tilts
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.35;
      haloRef.current.rotation.x = -Math.PI / 2 + Math.sin(t * 0.5) * 0.08;
    }
    // pulse inner light
    if (innerLightRef.current) {
      innerLightRef.current.intensity = 4 + Math.sin(t * 2.2) * 1.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* aura halo behind */}
      <mesh position={[0, 0.3, -0.6]} scale={[1.7, 1.7, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial
          color={palette.glow}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* cloak — torus-like draped form built from cone + sphere */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <coneGeometry args={[0.95, 1.6, 32, 1, true]} />
        <meshStandardMaterial
          color={palette.cloakOuter}
          metalness={0.3}
          roughness={0.55}
          side={THREE.DoubleSide}
          emissive={palette.cloakInner}
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* cloak trim ring at shoulder */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={palette.trim}
          emissive={palette.trim}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* hood — rounded cone */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
        <meshStandardMaterial
          color={palette.cloakOuter}
          metalness={0.35}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* inner glow heart — emissive sphere inside cloak chest */}
      <mesh position={[0, -0.05, 0.15]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color={palette.innerLight}
          emissive={palette.innerLight}
          emissiveIntensity={3.5}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={innerLightRef}
        color={palette.innerLight}
        intensity={4.5}
        distance={2.2}
        decay={2}
        position={[0, -0.05, 0.2]}
      />

      {/* face shadow — darker sphere inside hood */}
      <mesh position={[0, 0.42, 0.15]}>
        <sphereGeometry args={[0.27, 24, 24]} />
        <meshBasicMaterial color="#0a0814" />
      </mesh>

      {/* eyes — two emissive points */}
      <mesh position={[-0.09, 0.45, 0.32]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={palette.glow} toneMapped={false} />
      </mesh>
      <mesh position={[0.09, 0.45, 0.32]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={palette.glow} toneMapped={false} />
      </mesh>
      <pointLight
        color={palette.glow}
        intensity={0.7}
        distance={0.8}
        position={[0, 0.45, 0.35]}
      />

      {/* shoulder pads */}
      <mesh position={[-0.55, 0.05, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={palette.cloakOuter}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.55, 0.05, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={palette.cloakOuter}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* shoulder trim glow */}
      <mesh position={[-0.55, 0.2, 0]}>
        <torusGeometry args={[0.18, 0.012, 12, 32]} />
        <meshStandardMaterial
          color={palette.trim}
          emissive={palette.trim}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.55, 0.2, 0]}>
        <torusGeometry args={[0.18, 0.012, 12, 32]} />
        <meshStandardMaterial
          color={palette.trim}
          emissive={palette.trim}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* crown — L8+ */}
      {hasCrown && (
        <group position={[0, 0.82, 0]}>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.22, 0.1, Math.sin(a) * 0.22]}
                rotation={[0, -a, 0]}
              >
                <coneGeometry args={[0.04, 0.16, 4]} />
                <meshStandardMaterial
                  color={palette.trim}
                  emissive={palette.trim}
                  emissiveIntensity={1.2}
                  metalness={0.8}
                  roughness={0.2}
                  toneMapped={false}
                />
              </mesh>
            );
          })}
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.025, 16, 32]} />
            <meshStandardMaterial
              color={palette.trim}
              emissive={palette.trim}
              emissiveIntensity={1.4}
              metalness={0.9}
              roughness={0.15}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {/* halo — L12+ */}
      {hasHalo && (
        <mesh ref={haloRef} position={[0, 0.95, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.5, 64]} />
          <meshBasicMaterial
            ref={haloMatRef}
            color={palette.glow}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* wings — L15+ */}
      {hasWings && (
        <group position={[0, 0.1, -0.15]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.55, 0, 0]}
              rotation={[0, side * 0.3, side * 0.4]}
            >
              <planeGeometry args={[0.9, 0.7, 6, 4]} />
              <meshStandardMaterial
                color={palette.cloakOuter}
                emissive={palette.glow}
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function OrbitingRunes({
  count,
  color,
  radius = 1.4,
}: {
  count: number;
  color: string;
  radius?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    groupRef.current.rotation.x =
      Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
  });
  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}
            rotation={[0, -a, 0]}
          >
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Particles({ color, count = 60 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.9 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

export function Avatar3D({
  size = 280,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const xp = useStore((s) => s.xp);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);

  const lvl = levelFromXP(xp);
  const palette = paletteForLevel(lvl.num);

  const runeCount = useMemo(() => {
    // 1 rune per defeated boss + base 2
    const states = initialBosses.map((b) =>
      computeBossState(b, tasks, habits, habitLogs)
    );
    const defeated = states.filter((s) => s.defeated).length;
    return Math.min(6, 2 + defeated);
  }, [tasks, habits, habitLogs]);

  const hasCrown = lvl.num >= 8;
  const hasHalo = lvl.num >= 12;
  const hasWings = lvl.num >= 15;

  return (
    <div
      className={className}
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0.2, 3.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* key light */}
          <directionalLight
            position={[2, 2.5, 3]}
            intensity={0.9}
            color="#ffffff"
          />
          {/* rim light from behind */}
          <directionalLight
            position={[-1.5, 1, -2]}
            intensity={0.8}
            color={palette.glow}
          />
          {/* fill */}
          <ambientLight intensity={0.32} />
          {/* ground reflection */}
          <pointLight
            position={[0, -2, 1]}
            intensity={0.4}
            color={palette.trim}
          />

          <Character
            palette={palette}
            level={lvl.num}
            hasCrown={hasCrown}
            hasWings={hasWings}
            hasHalo={hasHalo}
          />

          <OrbitingRunes count={runeCount} color={palette.trim} radius={1.35} />

          <Particles color={palette.innerLight} count={70} />
        </Suspense>
      </Canvas>
    </div>
  );
}
