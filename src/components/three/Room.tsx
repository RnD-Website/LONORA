"use client";

import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, MeshReflectorMaterial } from "@react-three/drei";
import type { RoomLayout, RoomPreset } from "@/lib/content";
import { arcadeGeometry, flutedColumn, lighten, noiseTexture, plankTexture, seeded, slabTexture } from "./materials";

export const ROOM_W = 12;
export const ROOM_H = 4.6;

type MatProps = { color: string | THREE.Color; rough?: number; metal?: number; bump?: number };

/** Plaster/stone-like standard material with shared procedural micro-texture. */
export function Mat({ color, rough = 0.85, metal = 0, bump = 0.015 }: MatProps) {
  const noise = noiseTexture();
  return (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      metalness={metal}
      roughnessMap={noise}
      bumpMap={noise}
      bumpScale={bump}
    />
  );
}

function Box({
  args,
  position,
  rotation,
  children,
  cast = true,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
  cast?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={cast} receiveShadow>
      <boxGeometry args={args} />
      {children}
    </mesh>
  );
}

/* ------------------------------------------------------------------ shell -- */

export function Shell({
  preset,
  length,
  quality,
  skylightZ,
  startZ = 0,
}: {
  preset: RoomPreset;
  length: number;
  quality: "high" | "low";
  skylightZ?: number;
  startZ?: number;
}) {
  const W = ROOM_W;
  const H = ROOM_H;
  const floorLen = length + 24;
  const floorCenter = startZ - length / 2 + 6;

  const floorMap = useMemo(() => {
    const src = preset.floorPattern === "plank" ? plankTexture(preset.floor) : slabTexture(preset.floor);
    const t = src.clone();
    t.needsUpdate = true;
    const tile = preset.floorPattern === "plank" ? 2.4 : 4.8;
    t.repeat.set(W / tile, floorLen / tile);
    return t;
  }, [preset.floor, preset.floorPattern, floorLen, W]);

  const ceilingColor = useMemo(() => lighten(preset.wall, -0.18), [preset.wall]);
  const fins = useMemo(() => {
    const arr: number[] = [];
    for (let z = startZ - 0.4; z > startZ - length; z -= 0.85) arr.push(z);
    return arr;
  }, [length, startZ]);

  const gloss = preset.floorGloss;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, floorCenter]} receiveShadow>
        <planeGeometry args={[W + 0.4, floorLen]} />
        {quality === "high" && gloss > 0.4 ? (
          <MeshReflectorMaterial
            map={floorMap}
            color="#ffffff"
            roughness={1 - gloss * 0.7}
            metalness={0}
            blur={[400, 120]}
            resolution={512}
            mixBlur={1}
            mixStrength={gloss * 1.4}
            mirror={0}
            depthScale={0}
          />
        ) : (
          <meshStandardMaterial map={floorMap} roughness={1 - gloss * 0.6} roughnessMap={noiseTexture()} />
        )}
      </mesh>

      {/* Ceiling, optionally pierced by a skylight */}
      {skylightZ === undefined ? (
        <Box args={[W + 0.6, 0.3, length]} position={[0, H + 0.15, startZ - length / 2]}>
          <Mat color={ceilingColor} />
        </Box>
      ) : (
        <>
          {(() => {
            const s = 4.2;
            const a = startZ - (skylightZ - startZ < 0 ? 0 : 0);
            const frontLen = a - (skylightZ + s / 2);
            const backLen = skylightZ - s / 2 - (startZ - length);
            return (
              <>
                <Box args={[W + 0.6, 0.3, frontLen]} position={[0, H + 0.15, a - frontLen / 2]}>
                  <Mat color={ceilingColor} />
                </Box>
                <Box args={[W + 0.6, 0.3, backLen]} position={[0, H + 0.15, startZ - length + backLen / 2]}>
                  <Mat color={ceilingColor} />
                </Box>
                <Box args={[(W - s) / 2 + 0.3, 0.3, s]} position={[-(s / 2 + (W - s) / 4) - 0.15, H + 0.15, skylightZ]}>
                  <Mat color={ceilingColor} />
                </Box>
                <Box args={[(W - s) / 2 + 0.3, 0.3, s]} position={[s / 2 + (W - s) / 4 + 0.15, H + 0.15, skylightZ]}>
                  <Mat color={ceilingColor} />
                </Box>
              </>
            );
          })()}
        </>
      )}

      {/* Linear light slot in the ceiling */}
      <mesh position={[-W / 2 + 1.4, H - 0.01, startZ - length / 2]}>
        <boxGeometry args={[0.06, 0.02, length - 1]} />
        <meshBasicMaterial color={lighten(preset.sun, 0.6)} toneMapped={false} />
      </mesh>

      {/* Solid left wall with a shadow-gap skirting */}
      <Box args={[0.3, H, length]} position={[-W / 2 - 0.15, H / 2, startZ - length / 2]}>
        <Mat color={preset.wall} />
      </Box>

      {/* Right wall: vertical fins so the sun draws stripes across the floor */}
      <Box args={[0.4, 0.5, length]} position={[W / 2 + 0.1, H - 0.25, startZ - length / 2]}>
        <Mat color={preset.wall} />
      </Box>
      <Box args={[0.6, 0.3, length]} position={[W / 2 + 0.1, 0.15, startZ - length / 2]}>
        <Mat color={lighten(preset.wall, -0.1)} />
      </Box>
      {fins.map((z) => (
        <Box key={z} args={[0.55, H - 0.6, 0.11]} position={[W / 2 + 0.1, H / 2, z]}>
          <Mat color={preset.accent} rough={0.55} metal={0.35} />
        </Box>
      ))}
      {/* Glazing tint + bright exterior beyond */}
      <mesh position={[W / 2 + 9, H / 2 + 1, startZ - length / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length + 40, 30]} />
        <meshBasicMaterial color={lighten(preset.sun, 0.35)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------- furniture -- */

export function Sofa({ position, rotation = 0, color, width = 3.2 }: { position: [number, number, number]; rotation?: number; color: string; width?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width, 0.42, 1]} radius={0.12} smoothness={4} position={[0, 0.21, 0]} castShadow receiveShadow>
        <Mat color={color} rough={0.95} bump={0.03} />
      </RoundedBox>
      <RoundedBox args={[width, 0.55, 0.26]} radius={0.12} smoothness={4} position={[0, 0.62, -0.38]} castShadow receiveShadow>
        <Mat color={color} rough={0.95} bump={0.03} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.26, 0.6, 1]} radius={0.12} smoothness={4} position={[(s * (width - 0.26)) / 2, 0.36, 0]} castShadow>
          <Mat color={color} rough={0.95} bump={0.03} />
        </RoundedBox>
      ))}
      {/* cushions */}
      {[-0.6, 0.6].map((x) => (
        <RoundedBox key={x} args={[0.5, 0.4, 0.14]} radius={0.06} position={[x * (width / 3.2), 0.62, -0.2]} rotation={[-0.2, 0, 0]} castShadow>
          <Mat color={lighten(color, -0.12)} rough={1} bump={0.04} />
        </RoundedBox>
      ))}
    </group>
  );
}

export function LoungeChair({ position, rotation = 0, color, frame }: { position: [number, number, number]; rotation?: number; color: string; frame: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.9, 0.36, 0.9]} radius={0.15} smoothness={4} position={[0, 0.32, 0]} castShadow>
        <Mat color={color} rough={1} bump={0.03} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.7, 0.2]} radius={0.1} smoothness={4} position={[0, 0.68, -0.4]} rotation={[-0.25, 0, 0]} castShadow>
        <Mat color={color} rough={1} bump={0.03} />
      </RoundedBox>
      <mesh position={[0, 0.07, 0]} castShadow>
        <boxGeometry args={[0.8, 0.14, 0.8]} />
        <Mat color={frame} rough={0.4} metal={0.6} />
      </mesh>
    </group>
  );
}

export function Vase({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push(new THREE.Vector2(0.05 + Math.sin(t * Math.PI) * 0.22 + (1 - t) * 0.04, t * 0.9));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geo} castShadow receiveShadow>
        <Mat color={color} rough={0.6} bump={0.02} />
      </mesh>
      {/* branches */}
      {[-0.4, 0.1, 0.5].map((r, i) => (
        <mesh key={i} position={[Math.sin(r) * 0.25, 1.35, Math.cos(r) * 0.05]} rotation={[0, 0, r]} castShadow>
          <cylinderGeometry args={[0.008, 0.015, 1.1, 5]} />
          <meshStandardMaterial color="#3b2f25" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leaves = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 16 }, () => ({
      p: [(rnd() - 0.5) * 0.9, 0.9 + rnd() * 1.1, (rnd() - 0.5) * 0.9] as [number, number, number],
      s: 0.18 + rnd() * 0.22,
    }));
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.26, 0.6, 32]} />
        <Mat color="#d8cbb6" rough={0.9} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#4a3a2a" />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} scale={[l.s, l.s * 0.5, l.s]} castShadow>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color="#56603f" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Pendant({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.025, 12, 96]} />
        <meshBasicMaterial color={lighten(color, 0.7)} toneMapped={false} />
      </mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.85, (ROOM_H - position[1]) / 2, Math.sin(a) * 0.85]}>
          <cylinderGeometry args={[0.004, 0.004, ROOM_H - position[1], 4]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      ))}
      <pointLight color={color} intensity={4} distance={6} decay={2} />
    </group>
  );
}

function Globe({ position, color, intensity = 2 }: { position: [number, number, number]; color: string; intensity?: number }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.22, 32, 16]} />
        <meshBasicMaterial color={lighten(color, 0.5)} toneMapped={false} />
      </mesh>
      <mesh position={[0, (ROOM_H - position[1]) / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, ROOM_H - position[1], 4]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <pointLight color={color} intensity={intensity} distance={5} decay={2} />
    </group>
  );
}

/* ---------------------------------------------------------------- layouts -- */

type ContentsProps = { preset: RoomPreset; z?: number; quality: "high" | "low"; partition?: boolean };

function Living({ preset, z = 0, partition = true }: ContentsProps) {
  const stone = lighten(preset.wall, 0.08);
  return (
    <group position={[0, 0, z]}>
      <Box args={[5.4, 0.025, 3.8]} position={[0.6, 0.012, -8]} cast={false}>
        <Mat color={lighten(preset.fabric, -0.1)} rough={1} bump={0.05} />
      </Box>
      <Sofa position={[0.6, 0, -9.7]} color={preset.fabric} />
      <LoungeChair position={[3, 0, -7.4]} rotation={-1.9} color={preset.fabric} frame={preset.accent} />
      <LoungeChair position={[-1.8, 0, -7.2]} rotation={1.9} color={preset.fabric} frame={preset.accent} />
      <mesh position={[0.6, 0.19, -8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.38, 64]} />
        <Mat color={stone} rough={0.5} />
      </mesh>
      <mesh position={[0.4, 0.54, -8]} castShadow>
        <sphereGeometry args={[0.16, 48, 24]} />
        <meshStandardMaterial color={preset.accent} metalness={0.9} roughness={0.25} />
      </mesh>
      {/* limestone spine with fireplace */}
      <Box args={[0.9, 3.4, 7]} position={[-5.4, 1.7, -9]}>
        <Mat color={stone} rough={0.75} bump={0.03} />
      </Box>
      <Box args={[0.3, 0.8, 2.4]} position={[-4.85, 0.75, -9]} cast={false}>
        <meshStandardMaterial color="#120d0a" roughness={1} />
      </Box>
      <mesh position={[-4.8, 0.55, -9]}>
        <boxGeometry args={[0.1, 0.18, 1.8]} />
        <meshBasicMaterial color="#ff9a4a" toneMapped={false} />
      </mesh>
      <pointLight position={[-4.3, 0.8, -9]} color="#ff8a3c" intensity={3} distance={5} />
      <Pendant position={[0.6, 3.1, -8]} color={preset.sun} />
      <Plant position={[4.8, 0, -12.2]} scale={1.2} />
      <Vase position={[-4.6, 3.4, -7.2]} color={preset.accent} scale={0.6} />
      {/* artwork */}
      <Box args={[2.6, 1.7, 0.06]} position={partition ? [0.6, 2.3, -12.9] : [-4.9, 2.4, -9]} rotation={partition ? undefined : [0, Math.PI / 2, 0]}>
        <Mat color={preset.accent} rough={0.95} bump={0.06} />
      </Box>
      {partition && (
        <Box args={[7, ROOM_H, 0.3]} position={[0.5, ROOM_H / 2, -13.1]}>
          <Mat color={preset.wall} />
        </Box>
      )}
    </group>
  );
}

function Gallery({ preset, z = 0, length = 18 }: ContentsProps & { length?: number }) {
  const col = useMemo(() => flutedColumn(0.32, ROOM_H, 22, 0.05), []);
  const zs = useMemo(() => {
    const a: number[] = [];
    for (let k = -2.5; k > -length; k -= 3) a.push(k);
    return a;
  }, [length]);
  const colColor = lighten(preset.wall, 0.12);
  return (
    <group position={[0, 0, z]}>
      {zs.map((cz) =>
        [-3.2, 3.2].map((x) => (
          <group key={`${x}${cz}`} position={[x, 0, cz]}>
            <mesh geometry={col} position={[0, ROOM_H / 2, 0]} castShadow receiveShadow>
              <Mat color={colColor} rough={0.8} bump={0.01} />
            </mesh>
            <Box args={[0.9, 0.12, 0.9]} position={[0, 0.06, 0]}>
              <Mat color={lighten(colColor, -0.06)} />
            </Box>
          </group>
        )),
      )}
      {zs.slice(0, -1).map((cz, i) => (
        <group key={cz} position={[-4.8, 0, cz - 1.5]}>
          <Box args={[0.7, 1 + (i % 2) * 0.25, 0.7]} position={[0, 0.5 + (i % 2) * 0.125, 0]}>
            <Mat color={lighten(preset.wall, -0.05)} />
          </Box>
          {i % 3 === 0 ? (
            <Vase position={[0, 1 + (i % 2) * 0.25, 0]} color={preset.accent} scale={0.7} />
          ) : i % 3 === 1 ? (
            <mesh position={[0, 1.55, 0]} castShadow>
              <torusKnotGeometry args={[0.18, 0.06, 128, 16]} />
              <meshStandardMaterial color={preset.accent} metalness={0.9} roughness={0.3} />
            </mesh>
          ) : (
            <mesh position={[0, 1.2, 0]} castShadow>
              <sphereGeometry args={[0.2, 48, 24]} />
              <Mat color={preset.fabric} rough={0.5} />
            </mesh>
          )}
        </group>
      ))}
      <Box args={[0.7, 0.45, 4]} position={[0, 0.225, -length / 2]}>
        <Mat color={lighten(preset.wall, 0.05)} rough={0.6} />
      </Box>
    </group>
  );
}

function Arcade({ preset, z = 0 }: ContentsProps) {
  const geo = useMemo(() => arcadeGeometry(ROOM_W, ROOM_H, 0.7, 3, 2.5, 3.5), []);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={geo} position={[0, 0, -12]} castShadow receiveShadow>
        <Mat color={preset.wall} bump={0.03} />
      </mesh>
      {/* garden beyond the arches */}
      <mesh position={[0, ROOM_H / 2, -18]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_H + 2]} />
        <meshBasicMaterial color={lighten(preset.sun, 0.25)} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -15]} receiveShadow>
        <planeGeometry args={[ROOM_W, 6]} />
        <Mat color={lighten(preset.accent, 0.15)} rough={1} />
      </mesh>
      {[-4, 0, 4].map((x, i) => (
        <group key={x} position={[x + (i - 1) * 0.4, 0, -15.5 + i * 0.4]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 2, 6]} />
            <meshStandardMaterial color="#4b3b2d" />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.sin(k * 2.1) * 0.6, 2.2 + Math.cos(k) * 0.3, Math.cos(k * 1.7) * 0.5]} castShadow>
              <icosahedronGeometry args={[0.6, 3]} />
              <meshStandardMaterial color="#66704c" roughness={0.9} bumpMap={noiseTexture()} bumpScale={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <Box args={[8, 0.45, 0.6]} position={[0, 0.225, -10.6]}>
        <Mat color={lighten(preset.wall, 0.08)} rough={0.6} />
      </Box>
      <Vase position={[-4.6, 0, -7]} color={preset.accent} scale={1.6} />
      <mesh position={[1.6, 0.38, -6.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 64]} />
        <Mat color={lighten(preset.wall, 0.1)} rough={0.4} />
      </mesh>
      <mesh position={[1.6, 0.18, -6.5]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 0.36, 32]} />
        <Mat color={preset.accent} rough={0.5} />
      </mesh>
      <LoungeChair position={[3.2, 0, -5.8]} rotation={-2.2} color={preset.fabric} frame={preset.accent} />
    </group>
  );
}

function Loft({ preset, z = 0, length = 18 }: ContentsProps & { length?: number }) {
  const slats = useMemo(() => {
    const a: number[] = [];
    for (let x = -ROOM_W / 2 + 0.15; x < ROOM_W / 2; x += 0.28) a.push(x);
    return a;
  }, []);
  return (
    <group position={[0, 0, z]}>
      {slats.map((x) => (
        <mesh key={x} position={[x, ROOM_H - 0.25, -length / 2]} castShadow>
          <boxGeometry args={[0.07, 0.22, length]} />
          <meshStandardMaterial color={lighten(preset.wall, -0.2)} roughness={0.7} />
        </mesh>
      ))}
      {/* bar */}
      <Box args={[1, 1.05, 8]} position={[-3.6, 0.525, -9]}>
        <Mat color={preset.accent} rough={0.35} bump={0.02} />
      </Box>
      <Box args={[1.2, 0.06, 8.2]} position={[-3.6, 1.08, -9]}>
        <Mat color={lighten(preset.accent, -0.3)} rough={0.2} />
      </Box>
      {[-6, -7.6, -9.2, -10.8, -12.4].map((bz) => (
        <Globe key={bz} position={[-3.6, 2.4, bz]} color={preset.sun} />
      ))}
      {/* backlit shelving */}
      {[0.9, 1.6, 2.3].map((y) => (
        <mesh key={y} position={[-5.82, y, -9]}>
          <boxGeometry args={[0.05, 0.03, 7]} />
          <meshBasicMaterial color={lighten(preset.sun, 0.3)} toneMapped={false} />
        </mesh>
      ))}
      {/* sunken lounge */}
      <Box args={[5, 0.02, 4.4]} position={[2.6, 0.01, -9]} cast={false}>
        <Mat color={lighten(preset.fabric, -0.25)} rough={1} bump={0.05} />
      </Box>
      <Sofa position={[2.6, 0, -11]} color={preset.fabric} width={3.6} />
      <Sofa position={[0.6, 0, -9]} rotation={Math.PI / 2} color={preset.fabric} width={2.6} />
      <mesh position={[2.8, 0.2, -9]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.4, 64]} />
        <meshStandardMaterial color={lighten(preset.accent, -0.2)} roughness={0.2} metalness={0.2} />
      </mesh>
      <Plant position={[5.2, 0, -13]} />
    </group>
  );
}

function Court({ preset, z = 0, skylightZ = -8 }: ContentsProps & { skylightZ?: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* reflecting pool under the skylight */}
      <Box args={[3.4, 0.22, 6.4]} position={[0, 0.11, skylightZ]}>
        <Mat color={lighten(preset.wall, 0.05)} rough={0.6} />
      </Box>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, skylightZ]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color={lighten(preset.accent, -0.35)} roughness={0.04} metalness={0.3} />
      </mesh>
      {/* sculptural tree */}
      <group position={[0, 0.2, skylightZ - 2.2]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.14, 2.2, 8]} />
          <meshStandardMaterial color="#4b3b2d" roughness={1} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <mesh key={k} position={[Math.sin(k * 2.4) * 0.8, 2.4 + Math.cos(k * 1.3) * 0.4, Math.cos(k * 2.4) * 0.6]} castShadow>
            <icosahedronGeometry args={[0.55, 3]} />
            <meshStandardMaterial color="#5f6a46" roughness={0.9} bumpMap={noiseTexture()} bumpScale={0.4} />
          </mesh>
        ))}
      </group>
      {/* stair along the left wall */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} args={[1.4, 0.18, 0.32]} position={[-5.2, 0.09 + i * 0.18, skylightZ + 3 - i * 0.32]}>
          <Mat color={lighten(preset.wall, 0.06)} />
        </Box>
      ))}
      <LoungeChair position={[3.2, 0, skylightZ + 1.5]} rotation={-1.4} color={preset.fabric} frame={preset.accent} />
      <LoungeChair position={[3.2, 0, skylightZ - 0.4]} rotation={-1.6} color={preset.fabric} frame={preset.accent} />
      <Plant position={[4.8, 0, skylightZ - 4]} scale={1.3} />
    </group>
  );
}

export function Contents({ layout, ...props }: ContentsProps & { layout: RoomLayout; length?: number; skylightZ?: number }) {
  switch (layout) {
    case "living":
      return <Living {...props} />;
    case "gallery":
      return <Gallery {...props} />;
    case "arch":
      return <Arcade {...props} />;
    case "loft":
      return <Loft {...props} />;
    case "court":
      return <Court {...props} />;
  }
}

/* ------------------------------------------------------------------ light -- */

/** Low raking sun. Optionally follows a moving camera so shadows stay crisp. */
export function Sun({
  preset,
  center = -8,
  follow = false,
  mapSize = 2048,
  height = 9,
}: {
  preset: RoomPreset;
  center?: number;
  follow?: boolean;
  mapSize?: number;
  height?: number;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }) => {
    if (!follow || !light.current) return;
    const cz = camera.position.z - 7;
    light.current.position.set(13, height, cz + 4);
    target.position.set(0, 0, cz);
    target.updateMatrixWorld();
  });

  return (
    <>
      <primitive object={target} position={[0, 0, center]} />
      <directionalLight
        ref={light}
        position={[13, height, center + 4]}
        target={target}
        color={preset.sun}
        intensity={preset.sunIntensity}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      <hemisphereLight args={[preset.ambient, lighten(preset.floor, -0.3), 0.55]} />
    </>
  );
}
