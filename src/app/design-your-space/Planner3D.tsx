"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  ARCH,
  BACK,
  FEATURE_SPAN,
  FIREPLACE_Z,
  FLOORS,
  FURN,
  LEFT,
  ROOM,
  STONES,
  UPHOLSTERY,
  WALLS,
  WINDOW,
  WINDOW_Z,
  WOODS,
  clampToRoom,
  find,
  finishOf,
  type FloorKind,
  type Item,
  type LightId,
  type Style,
} from "./catalog";

export type CameraView = "front" | "corner" | "plan";

const ORANGE = "#FF6325";
const LINE = "#3a3532";
const BRONZE = "#3a3027";
const LINEN = "#F3EEE5";

type V3 = [number, number, number];
type Ctx = { drawing: boolean; evening: boolean };
const SceneCtx = createContext<Ctx>({ drawing: false, evening: false });

/* ============================================================ Textures == */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const tone = (hex: string, l: number, s = 0) => "#" + new THREE.Color(hex).offsetHSL(0, s, l).getHexString();

/** Procedural floor: 2 m × 2 m tile drawn on a canvas. */
function floorTexture(kind: FloorKind, base: string) {
  const S = 1024;
  const px = S / 2; // pixels per metre
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const r = rng(kind.length * 97 + base.charCodeAt(2));
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);

  const grain = (x: number, y: number, w: number, h: number, horizontal: boolean) => {
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    g.globalAlpha = 0.07;
    g.strokeStyle = tone(base, -0.18);
    g.lineWidth = 1;
    const n = 6;
    for (let k = 0; k < n; k++) {
      g.beginPath();
      if (horizontal) {
        const yy = y + ((k + r()) / n) * h;
        g.moveTo(x, yy);
        g.bezierCurveTo(x + w * 0.3, yy + (r() - 0.5) * 6, x + w * 0.7, yy + (r() - 0.5) * 6, x + w, yy);
      } else {
        const xx = x + ((k + r()) / n) * w;
        g.moveTo(xx, y);
        g.bezierCurveTo(xx + (r() - 0.5) * 6, y + h * 0.3, xx + (r() - 0.5) * 6, y + h * 0.7, xx, y + h);
      }
      g.stroke();
    }
    g.restore();
  };

  if (kind === "planks") {
    const bw = 0.19 * px;
    for (let y = 0; y < S; y += bw) {
      let x = -r() * 1.2 * px;
      while (x < S) {
        const len = (0.9 + r() * 1.0) * px;
        g.fillStyle = tone(base, (r() - 0.5) * 0.07, (r() - 0.5) * 0.04);
        g.fillRect(x, y, len, bw);
        grain(x, y, len, bw, true);
        g.fillStyle = tone(base, -0.16);
        g.globalAlpha = 0.5;
        g.fillRect(x, y, 1.5, bw);
        g.globalAlpha = 1;
        x += len;
      }
      g.fillStyle = tone(base, -0.18);
      g.globalAlpha = 0.55;
      g.fillRect(0, y, S, 1.5);
      g.globalAlpha = 1;
    }
  } else if (kind === "herringbone") {
    const W = 0.09 * px;
    const L = 0.45 * px;
    const plank = (x: number, y: number, w: number, h: number, horizontal: boolean) => {
      g.fillStyle = tone(base, (r() - 0.5) * 0.08, (r() - 0.5) * 0.04);
      g.fillRect(x, y, w, h);
      grain(x, y, w, h, horizontal);
      g.strokeStyle = tone(base, -0.17);
      g.globalAlpha = 0.55;
      g.lineWidth = 1.2;
      g.strokeRect(x, y, w, h);
      g.globalAlpha = 1;
    };
    // Lattice (W, W) × (L, −L) tiles one horizontal + one vertical plank.
    for (let j = -4; j < S / L + 6; j++) {
      for (let i = -Math.ceil((S + L * 6) / W); i < Math.ceil((S + L * 6) / W); i++) {
        const ox = i * W + j * L;
        const oy = i * W - j * L;
        if (ox > S + L || oy > S + L || ox < -2 * L || oy < -2 * L) continue;
        plank(ox, oy, L, W, true);
        plank(ox, oy + W, W, L, false);
      }
    }
  } else if (kind === "tiles") {
    const t = 0.6 * px;
    for (let y = 0; y < S; y += t) {
      for (let x = 0; x < S; x += t) {
        g.fillStyle = tone(base, (r() - 0.5) * 0.05);
        g.fillRect(x, y, t, t);
        g.globalAlpha = 0.08;
        for (let k = 0; k < 40; k++) {
          g.fillStyle = r() > 0.5 ? tone(base, -0.2) : tone(base, 0.1);
          g.beginPath();
          g.arc(x + r() * t, y + r() * t, r() * 3 + 0.5, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = tone(base, -0.12);
        g.fillRect(x, y, t, 2);
        g.fillRect(x, y, 2, t);
      }
    }
  } else {
    const chips = ["#b9b2a7", "#8f877d", "#c87c5a", "#f7f4ee", "#5f5a55", "#d9c2a0"];
    for (let k = 0; k < 5200; k++) {
      g.fillStyle = chips[Math.floor(r() * chips.length)];
      g.globalAlpha = 0.85;
      const x = r() * S;
      const y = r() * S;
      const s = r() < 0.92 ? 1.5 + r() * 3 : 5 + r() * 7;
      g.beginPath();
      g.moveTo(x + s, y);
      for (let a = 1; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        const rr = s * (0.6 + r() * 0.5);
        g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
      }
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(ROOM.w / 2, ROOM.d / 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Soft, mottled greyscale used to give walls a lime-plaster feel. */
function plasterTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const r = rng(7);
  g.fillStyle = "#f5f5f5";
  g.fillRect(0, 0, S, S);
  g.filter = "blur(16px)";
  for (let k = 0; k < 260; k++) {
    g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.22)" : "rgba(218,218,218,0.12)";
    g.beginPath();
    g.arc(r() * S, r() * S, 20 + r() * 70, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = "none";
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.45, 0.45); // wall uvs are in metres
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ============================================================== Helpers == */

function Mat({ c, r = 0.75, m = 0, glow, map }: { c: string; r?: number; m?: number; glow?: string; map?: THREE.Texture }) {
  const { drawing, evening } = useContext(SceneCtx);
  if (drawing) return <meshBasicMaterial color="#f2efe9" />;
  const on = Boolean(glow && evening);
  return (
    <meshStandardMaterial
      color={c}
      roughness={r}
      metalness={m}
      map={map ?? null}
      emissive={on ? glow : "#000000"}
      emissiveIntensity={on ? 1.7 : 0}
    />
  );
}

function Ed({ t = 25 }: { t?: number }) {
  const { drawing } = useContext(SceneCtx);
  return drawing ? <Edges color={LINE} threshold={t} /> : null;
}

function B({ s, p, c, r, m, glow, rot }: { s: V3; p: V3; c: string; r?: number; m?: number; glow?: string; rot?: V3 }) {
  const { drawing } = useContext(SceneCtx);
  return (
    <mesh position={p} rotation={rot} castShadow={!drawing} receiveShadow={!drawing}>
      <boxGeometry args={s} />
      <Mat c={c} r={r} m={m} glow={glow} />
      <Ed />
    </mesh>
  );
}

function RB({ s, p, c, rad = 0.05, rot, r = 0.95 }: { s: V3; p: V3; c: string; rad?: number; rot?: V3; r?: number }) {
  const { drawing } = useContext(SceneCtx);
  // Line drawings read better with crisp boxes than rounded ones.
  if (drawing) return <B s={s} p={p} c={c} rot={rot} />;
  return (
    <RoundedBox args={s} radius={rad} smoothness={3} position={p} rotation={rot} castShadow={!drawing} receiveShadow={!drawing}>
      <Mat c={c} r={r} />
      <Ed t={20} />
    </RoundedBox>
  );
}

function Cyl({
  a,
  p,
  c,
  r,
  m,
  glow,
  rot,
}: { a: [number, number, number, number?]; p: V3; c: string; r?: number; m?: number; glow?: string; rot?: V3 }) {
  const { drawing } = useContext(SceneCtx);
  return (
    <mesh position={p} rotation={rot} castShadow={!drawing} receiveShadow={!drawing}>
      <cylinderGeometry args={[a[0], a[1], a[2], a[3] ?? 32]} />
      <Mat c={c} r={r} m={m} glow={glow} />
      <Ed t={40} />
    </mesh>
  );
}

function Glow({ p, intensity = 2.4, distance = 4 }: { p: V3; intensity?: number; distance?: number }) {
  const { drawing, evening } = useContext(SceneCtx);
  if (!evening || drawing) return null;
  return <pointLight position={p} intensity={intensity} distance={distance} decay={1.6} color="#ffb877" />;
}

/* ========================================================== Furniture == */

type Fin = { up: string; wood: string; stone: string };
const soft = (c: string, l = 0.08) => tone(c, l);

function Sofa({ up, wood }: Fin) {
  const w = 2.3;
  const d = 0.95;
  return (
    <group>
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sz], i) => (
        <B key={i} s={[0.05, 0.08, 0.05]} p={[sx * (w / 2 - 0.12), 0.04, sz * (d / 2 - 0.12)]} c={wood} />
      ))}
      <RB s={[w, 0.24, d]} p={[0, 0.2, 0]} c={up} rad={0.06} />
      <RB s={[(w - 0.36) / 2 - 0.01, 0.16, d - 0.28]} p={[-(w - 0.36) / 4, 0.39, 0.1]} c={up} rad={0.07} />
      <RB s={[(w - 0.36) / 2 - 0.01, 0.16, d - 0.28]} p={[(w - 0.36) / 4, 0.39, 0.1]} c={up} rad={0.07} />
      <RB s={[w - 0.04, 0.46, 0.24]} p={[0, 0.53, -d / 2 + 0.13]} c={up} rad={0.1} />
      <RB s={[0.18, 0.38, d]} p={[-(w / 2 - 0.09), 0.43, 0]} c={up} rad={0.08} />
      <RB s={[0.18, 0.38, d]} p={[w / 2 - 0.09, 0.43, 0]} c={up} rad={0.08} />
      <RB s={[0.46, 0.42, 0.14]} p={[-0.6, 0.66, -d / 2 + 0.32]} rot={[-0.25, 0, 0.08]} c={soft(up, -0.06)} rad={0.06} />
      <RB s={[0.42, 0.38, 0.13]} p={[0.62, 0.64, -d / 2 + 0.32]} rot={[-0.25, 0, -0.06]} c={soft(up, 0.05)} rad={0.06} />
    </group>
  );
}

function Lounge({ up, wood }: Fin) {
  return (
    <group>
      <B s={[0.06, 0.56, 0.8]} p={[-0.38, 0.28, 0]} c={wood} r={0.55} />
      <B s={[0.06, 0.56, 0.8]} p={[0.38, 0.28, 0]} c={wood} r={0.55} />
      <RB s={[0.7, 0.16, 0.72]} p={[0, 0.36, 0.02]} c={up} rad={0.06} />
      <RB s={[0.7, 0.52, 0.16]} p={[0, 0.64, -0.3]} rot={[-0.22, 0, 0]} c={up} rad={0.07} />
    </group>
  );
}

function Chair({ up, wood }: Fin) {
  return (
    <group>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <B key={i} s={[0.035, 0.45, 0.035]} p={[sx * 0.19, 0.225, sz * 0.19]} c={wood} r={0.55} />
      ))}
      <B s={[0.46, 0.04, 0.46]} p={[0, 0.47, 0]} c={wood} r={0.55} />
      <RB s={[0.42, 0.05, 0.4]} p={[0, 0.51, 0.01]} c={up} rad={0.02} />
      <B s={[0.035, 0.42, 0.035]} p={[-0.19, 0.7, -0.21]} c={wood} r={0.55} />
      <B s={[0.035, 0.42, 0.035]} p={[0.19, 0.7, -0.21]} c={wood} r={0.55} />
      <B s={[0.44, 0.16, 0.03]} p={[0, 0.84, -0.21]} c={wood} r={0.55} />
    </group>
  );
}

function Coffee({ stone }: Fin) {
  return (
    <group>
      <Cyl a={[0.3, 0.3, 0.33]} p={[0, 0.165, 0]} c={tone(stone, -0.04)} r={0.6} />
      <Cyl a={[0.55, 0.55, 0.07]} p={[0, 0.365, 0]} c={stone} r={0.45} />
      <Cyl a={[0.07, 0.06, 0.16]} p={[0.22, 0.48, -0.1]} c="#efe8dc" r={0.5} />
      <B s={[0.26, 0.04, 0.2]} p={[-0.18, 0.42, 0.08]} c="#8b6b52" />
    </group>
  );
}

function Side({ stone }: Fin) {
  return <Cyl a={[0.24, 0.24, 0.5]} p={[0, 0.25, 0]} c={stone} r={0.5} />;
}

function Dining({ wood, stone }: Fin) {
  return (
    <group>
      <B s={[2.2, 0.06, 1.0]} p={[0, 0.74, 0]} c={wood} r={0.5} />
      <B s={[0.14, 0.71, 0.72]} p={[-0.72, 0.355, 0]} c={stone} r={0.55} />
      <B s={[0.14, 0.71, 0.72]} p={[0.72, 0.355, 0]} c={stone} r={0.55} />
      <Cyl a={[0.09, 0.11, 0.24]} p={[0, 0.89, 0]} c="#e9e1d4" r={0.5} />
      <Cyl a={[0.012, 0.012, 0.3]} p={[-0.02, 1.13, 0.01]} c="#6d7a52" />
      <Cyl a={[0.012, 0.012, 0.26]} p={[0.04, 1.1, -0.02]} c="#6d7a52" rot={[0, 0, -0.25]} />
    </group>
  );
}

function Sideboard({ wood, stone }: Fin) {
  return (
    <group>
      <B s={[1.7, 0.12, 0.38]} p={[0, 0.06, 0]} c={tone(wood, -0.08)} />
      <B s={[1.8, 0.6, 0.45]} p={[0, 0.42, 0]} c={wood} r={0.55} />
      {[-0.45, 0, 0.45].map((x) => (
        <B key={x} s={[0.008, 0.52, 0.006]} p={[x, 0.42, 0.226]} c={tone(wood, -0.2)} />
      ))}
      <B s={[1.84, 0.03, 0.47]} p={[0, 0.735, 0]} c={stone} r={0.4} />
      <Cyl a={[0.06, 0.08, 0.34]} p={[-0.55, 0.92, 0]} c="#ece5d9" r={0.5} />
      <Cyl a={[0.1, 0.1, 0.12]} p={[-0.3, 0.81, 0.04]} c="#b47a5c" r={0.6} />
      <B s={[0.32, 0.07, 0.22]} p={[0.45, 0.785, 0]} c="#7d6450" />
      <B s={[0.28, 0.05, 0.2]} p={[0.45, 0.845, 0]} c="#d8cdbd" />
    </group>
  );
}

function Shelf({ wood }: Fin) {
  const books = ["#7d6450", "#c9b79c", "#3f3a36", "#b46f50", "#e5ddd0", "#6e7250"];
  return (
    <group>
      <B s={[0.03, 2.0, 0.36]} p={[-0.585, 1.0, 0]} c={wood} r={0.55} />
      <B s={[0.03, 2.0, 0.36]} p={[0.585, 1.0, 0]} c={wood} r={0.55} />
      {[0.02, 0.5, 1.0, 1.5, 1.98].map((y) => (
        <B key={y} s={[1.2, 0.03, 0.36]} p={[0, y, 0]} c={wood} r={0.55} />
      ))}
      {[0.5, 1.0, 1.5].map((y, row) =>
        Array.from({ length: 6 }).map((_, k) => (
          <B
            key={`${row}-${k}`}
            s={[0.04, 0.24 + ((k * 7 + row * 3) % 5) * 0.025, 0.24]}
            p={[-0.5 + k * 0.05 + row * 0.3, y + 0.14 + ((k * 7 + row * 3) % 5) * 0.0125, 0]}
            c={books[(k + row * 2) % books.length]}
          />
        )),
      )}
      <Cyl a={[0.07, 0.09, 0.26]} p={[0.35, 0.165, 0]} c="#ece5d9" r={0.5} />
      <Cyl a={[0.09, 0.09, 0.09]} p={[0.32, 1.565, 0]} c="#b47a5c" r={0.6} />
    </group>
  );
}

function Nightstand({ wood, stone }: Fin) {
  return (
    <group>
      <B s={[0.5, 0.5, 0.42]} p={[0, 0.25, 0]} c={wood} r={0.55} />
      <B s={[0.46, 0.006, 0.005]} p={[0, 0.32, 0.211]} c={tone(wood, -0.2)} />
      <Cyl a={[0.06, 0.07, 0.22]} p={[0.06, 0.61, -0.04]} c={stone} r={0.5} />
      <Cyl a={[0.1, 0.14, 0.17]} p={[0.06, 0.8, -0.04]} c={LINEN} glow="#ffcf94" />
      <Glow p={[0.06, 0.8, 0.1]} intensity={1.3} distance={2.4} />
    </group>
  );
}

function Bed({ up }: Fin) {
  return (
    <group>
      <RB s={[1.9, 0.32, 2.1]} p={[0, 0.17, 0.02]} c={up} rad={0.05} />
      <RB s={[1.8, 0.22, 1.96]} p={[0, 0.43, 0.04]} c="#F4F0E8" rad={0.07} />
      <RB s={[2.0, 1.02, 0.14]} p={[0, 0.62, -1.0]} c={up} rad={0.06} />
      <RB s={[0.66, 0.15, 0.36]} p={[-0.4, 0.6, -0.74]} rot={[-0.3, 0, 0]} c="#F8F5EF" rad={0.06} />
      <RB s={[0.66, 0.15, 0.36]} p={[0.4, 0.6, -0.74]} rot={[-0.3, 0, 0]} c="#F8F5EF" rad={0.06} />
      <RB s={[1.86, 0.04, 0.7]} p={[0, 0.555, 0.62]} c={soft(up, -0.1)} rad={0.015} />
    </group>
  );
}

function FloorLamp({ stone }: Fin) {
  return (
    <group>
      <Cyl a={[0.16, 0.16, 0.03]} p={[0, 0.015, 0]} c={stone} r={0.5} />
      <Cyl a={[0.012, 0.012, 1.45]} p={[0, 0.74, 0]} c={BRONZE} m={0.6} r={0.4} />
      <Cyl a={[0.19, 0.26, 0.32]} p={[0, 1.56, 0]} c={LINEN} glow="#ffcf94" />
      <Glow p={[0, 1.45, 0]} intensity={3} />
    </group>
  );
}

function Pendant() {
  const y = 1.66;
  return (
    <group>
      <Cyl a={[0.005, 0.005, ROOM.h - y]} p={[0, (ROOM.h + y) / 2, 0]} c={BRONZE} />
      <mesh position={[0, y, 0]} castShadow={false}>
        <sphereGeometry args={[0.25, 32, 24]} />
        <Mat c={LINEN} r={0.9} glow="#ffd29a" />
        <Ed t={8} />
      </mesh>
      <Glow p={[0, y - 0.1, 0]} intensity={3.4} distance={5} />
    </group>
  );
}

function Olive() {
  const leaves: [number, number, number, number][] = [
    [0, 1.62, 0, 0.3],
    [-0.22, 1.48, 0.08, 0.24],
    [0.22, 1.5, -0.06, 0.25],
    [0.05, 1.78, 0.12, 0.22],
    [-0.12, 1.75, -0.14, 0.2],
    [0.2, 1.3, 0.12, 0.18],
    [-0.2, 1.28, -0.1, 0.17],
    [0.0, 1.4, -0.22, 0.2],
  ];
  const { drawing } = useContext(SceneCtx);
  return (
    <group>
      <Cyl a={[0.26, 0.2, 0.48]} p={[0, 0.24, 0]} c="#b5775a" r={0.85} />
      <Cyl a={[0.035, 0.05, 1.05]} p={[0, 0.98, 0]} c="#6a5644" rot={[0.06, 0, 0.08]} />
      <Cyl a={[0.02, 0.03, 0.5]} p={[0.12, 1.3, 0]} c="#6a5644" rot={[0, 0, -0.7]} />
      <Cyl a={[0.02, 0.03, 0.45]} p={[-0.1, 1.25, 0.03]} c="#6a5644" rot={[0.2, 0, 0.7]} />
      {leaves.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow={!drawing}>
          <icosahedronGeometry args={[s, 1]} />
          {drawing ? <meshBasicMaterial color="#f2efe9" /> : <meshStandardMaterial color={i % 2 ? "#6f7b55" : "#7d8862"} roughness={0.9} flatShading />}
          <Ed t={30} />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ up }: Fin) {
  const c = "#" + new THREE.Color(up).lerp(new THREE.Color("#f4efe6"), 0.55).getHexString();
  return (
    <group>
      <RB s={[2.8, 0.016, 2.0]} p={[0, 0.008, 0]} c={c} rad={0.006} />
      <RB s={[2.5, 0.017, 1.7]} p={[0, 0.0085, 0]} c={tone(c, -0.05)} rad={0.006} />
    </group>
  );
}

const MODELS = {
  sofa: Sofa,
  lounge: Lounge,
  chair: Chair,
  coffee: Coffee,
  side: Side,
  dining: Dining,
  sideboard: Sideboard,
  shelf: Shelf,
  nightstand: Nightstand,
  bed: Bed,
  floorlamp: FloorLamp,
  pendant: Pendant,
  olive: Olive,
  rug: Rug,
} as const;

/* ======================================================= Placed piece == */

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();

function Piece({
  item,
  style,
  selected,
  onSelect,
  onMove,
}: {
  item: Item;
  style: Style;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
}) {
  const def = FURN[item.type];
  const get = useThree((s) => s.get);
  const setOrbit = (on: boolean) => {
    const c = get().controls as OrbitControlsImpl | null;
    if (c) c.enabled = on;
  };
  const drag = useRef<{ dx: number; dz: number } | null>(null);
  const [hover, setHover] = useState(false);
  const own = finishOf(item, style)?.color;
  const fin: Fin = {
    up: def.slot === "upholstery" && own ? own : find(UPHOLSTERY, style.upholstery).color,
    wood: def.slot === "wood" && own ? own : find(WOODS, style.wood).color,
    stone: def.slot === "stone" && own ? own : find(STONES, style.stone).color,
  };
  const Model = MODELS[item.type];

  const down = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(item.id);
    if (e.ray.intersectPlane(floorPlane, hit)) drag.current = { dx: hit.x - item.x, dz: hit.z - item.z };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setOrbit(false);
    document.body.style.cursor = "grabbing";
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    if (!e.ray.intersectPlane(floorPlane, hit)) return;
    const p = clampToRoom(item.type, hit.x - drag.current.dx, hit.z - drag.current.dz);
    onMove(item.id, p.x, p.z);
  };
  const up = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setOrbit(true);
    document.body.style.cursor = hover ? "grab" : "";
  };

  const ring = selected || hover;
  const rw = def.w + 0.12;
  const rd = def.d + 0.12;
  const t = 0.025;

  return (
    <group position={[item.x, 0, item.z]} rotation={[0, (item.rot * Math.PI) / 4, 0]}>
      <group
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          if (!drag.current) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHover(false);
          if (!drag.current) document.body.style.cursor = "";
        }}
      >
        <Model {...fin} />
      </group>
      {ring && (
        <group position={[0, 0.02, 0]}>
          {(
            [
              [0, rd / 2, rw, t],
              [0, -rd / 2, rw, t],
              [rw / 2, 0, t, rd],
              [-rw / 2, 0, t, rd],
            ] as const
          ).map(([x, z, w, d], i) => (
            <mesh key={i} position={[x, 0, z]}>
              <boxGeometry args={[w, 0.004, d]} />
              <meshBasicMaterial color={ORANGE} transparent opacity={selected ? 0.95 : 0.45} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {selected && (
        <Html position={[0, Math.min(def.h, 2.2) + 0.25, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <span className="whitespace-nowrap rounded-full bg-terracotta px-2.5 py-1 text-[11px] font-medium text-white shadow">
            {def.name}
          </span>
        </Html>
      )}
    </group>
  );
}

/* ================================================================ Room == */

function useWallMaterialProps(color: string, plaster: THREE.Texture) {
  return { color, map: plaster };
}

function WallMesh({ geo, color, plaster, position, rotation }: { geo: THREE.BufferGeometry; color: string; plaster: THREE.Texture; position: V3; rotation: V3 }) {
  const { drawing } = useContext(SceneCtx);
  const props = useWallMaterialProps(color, plaster);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} receiveShadow={!drawing} castShadow={!drawing}>
      {drawing ? (
        <meshBasicMaterial color="#ffffff" side={THREE.FrontSide} />
      ) : (
        <meshStandardMaterial {...props} roughness={0.95} side={THREE.FrontSide} shadowSide={THREE.DoubleSide} />
      )}
      {drawing && <Edges color={LINE} threshold={10} />}
    </mesh>
  );
}

function Room({ style, plaster, floorTex }: { style: Style; plaster: THREE.Texture; floorTex: THREE.Texture }) {
  const { drawing, evening } = useContext(SceneCtx);
  const wall = find(WALLS, style.walls).color;
  const floor = find(FLOORS, style.floor);
  const H = ROOM.h;

  const backGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(LEFT, -0.05);
    s.lineTo(-LEFT, -0.05);
    s.lineTo(-LEFT, H);
    s.lineTo(LEFT, H);
    s.closePath();
    if (style.back === "arch") {
      const { cx, w, h } = ARCH;
      const spring = h - w / 2;
      const hole = new THREE.Path();
      hole.moveTo(cx - w / 2, 0);
      hole.lineTo(cx - w / 2, spring);
      hole.absarc(cx, spring, w / 2, Math.PI, 0, true);
      hole.lineTo(cx + w / 2, 0);
      hole.closePath();
      s.holes.push(hole);
    }
    return new THREE.ShapeGeometry(s, 24);
  }, [style.back, H]);

  const leftGeo = useMemo(() => {
    const D = ROOM.d;
    const s = new THREE.Shape();
    s.moveTo(-D / 2, -0.05);
    s.lineTo(D / 2, -0.05);
    s.lineTo(D / 2, H);
    s.lineTo(-D / 2, H);
    s.closePath();
    for (const z of WINDOW_Z[style.window]) {
      const lx = -z;
      const hole = new THREE.Path();
      hole.moveTo(lx - WINDOW.w / 2, WINDOW.y0);
      hole.lineTo(lx + WINDOW.w / 2, WINDOW.y0);
      hole.lineTo(lx + WINDOW.w / 2, WINDOW.y1);
      hole.lineTo(lx - WINDOW.w / 2, WINDOW.y1);
      hole.closePath();
      s.holes.push(hole);
    }
    return new THREE.ShapeGeometry(s);
  }, [style.window, H]);

  const rightGeo = useMemo(() => {
    const D = ROOM.d;
    const s = new THREE.Shape();
    s.moveTo(-D / 2, -0.05);
    s.lineTo(D / 2, -0.05);
    s.lineTo(D / 2, H);
    s.lineTo(-D / 2, H);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, [H]);

  const floorKind = floor.kind;
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!drawing}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        {drawing ? (
          <meshBasicMaterial color="#ffffff" />
        ) : (
          <meshStandardMaterial map={floorTex} roughness={floorKind === "terrazzo" ? 0.35 : floorKind === "tiles" ? 0.55 : 0.62} />
        )}
        {drawing && <Edges color={LINE} />}
      </mesh>

      <WallMesh geo={backGeo} color={wall} plaster={plaster} position={[0, 0, BACK]} rotation={[0, 0, 0]} />
      <WallMesh geo={leftGeo} color={wall} plaster={plaster} position={[LEFT, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <WallMesh geo={rightGeo} color={wall} plaster={plaster} position={[-LEFT, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Skirting in the wall colour, slightly deeper */}
      {!drawing && (
        <>
          <B s={[ROOM.w, 0.08, 0.015]} p={[0, 0.04, BACK + 0.0075]} c={tone(wall, -0.04)} />
          <B s={[0.015, 0.08, ROOM.d]} p={[-LEFT - 0.0075, 0.04, 0]} c={tone(wall, -0.04)} />
        </>
      )}

      {style.back === "arch" && <ArchPassage wall={wall} floorTex={floorTex} plaster={plaster} evening={evening} />}
      {style.back === "slats" && <Slats wood={find(WOODS, style.wood).color} />}
      {style.back === "fluted" && <Fluting wall={wall} />}
      {WINDOW_Z[style.window].map((z) => (
        <WindowUnit key={z} z={z} wall={wall} stone={find(STONES, style.stone).color} />
      ))}
      {style.fireplace && <Fireplace wall={wall} stone={find(STONES, style.stone).color} plaster={plaster} />}
    </group>
  );
}

function ArchPassage({ wall, floorTex, plaster, evening }: { wall: string; floorTex: THREE.Texture; plaster: THREE.Texture; evening: boolean }) {
  const { drawing } = useContext(SceneCtx);
  const { cx, w, h } = ARCH;
  const depth = 1.7;
  const spring = h - w / 2;
  const deep = tone(wall, -0.07);
  const mat = (c: string, side: THREE.Side = THREE.FrontSide) =>
    drawing ? <meshBasicMaterial color="#ffffff" side={side} /> : <meshStandardMaterial color={c} map={plaster} roughness={0.95} side={side} />;
  return (
    <group position={[cx, 0, BACK - depth / 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[w, depth]} />
        {drawing ? <meshBasicMaterial color="#fff" /> : <meshStandardMaterial map={floorTex} roughness={0.6} />}
      </mesh>
      <mesh position={[-w / 2, spring / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, spring]} />
        {mat(deep)}
        {drawing && <Edges color={LINE} />}
      </mesh>
      <mesh position={[w / 2, spring / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, spring]} />
        {mat(deep)}
        {drawing && <Edges color={LINE} />}
      </mesh>
      <mesh position={[0, spring, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[w / 2, w / 2, depth, 32, 1, true, Math.PI / 2, Math.PI]} />
        {mat(deep, THREE.BackSide)}
      </mesh>
      <mesh position={[0, h / 2, -depth / 2]}>
        <planeGeometry args={[w, h]} />
        {mat(tone(wall, -0.1))}
      </mesh>
      {/* A small console and vessel at the end of the passage */}
      <B s={[0.7, 0.04, 0.28]} p={[0, 0.82, -depth / 2 + 0.16]} c={tone(wall, -0.18)} />
      <Cyl a={[0.08, 0.11, 0.36]} p={[0.1, 1.02, -depth / 2 + 0.16]} c="#b5775a" r={0.7} />
      {!drawing && <pointLight position={[0, 2.0, -0.2]} intensity={evening ? 2.6 : 0.8} distance={3} decay={1.6} color="#ffcf9c" />}
    </group>
  );
}

function Slats({ wood }: { wood: string }) {
  const [a, b] = FEATURE_SPAN;
  const pitch = 0.09;
  const n = Math.floor((b - a) / pitch);
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <B key={i} s={[0.045, ROOM.h, 0.035]} p={[a + pitch / 2 + i * pitch, ROOM.h / 2, BACK + 0.03]} c={wood} r={0.6} />
      ))}
      <B s={[b - a, ROOM.h, 0.01]} p={[(a + b) / 2, ROOM.h / 2, BACK + 0.006]} c={tone(wood, -0.25)} />
    </group>
  );
}

function Fluting({ wall }: { wall: string }) {
  const { drawing } = useContext(SceneCtx);
  const [a, b] = FEATURE_SPAN;
  const r = 0.042;
  const n = Math.floor((b - a) / (r * 2));
  const c = tone(wall, 0.02);
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[a + r + i * r * 2, ROOM.h / 2, BACK]} castShadow={!drawing} receiveShadow={!drawing}>
          <cylinderGeometry args={[r, r, ROOM.h, 14, 1, false, -Math.PI / 2, Math.PI]} />
          {drawing ? <meshBasicMaterial color="#fff" /> : <meshStandardMaterial color={c} roughness={0.9} />}
          {drawing && i % 3 === 0 && <Edges color={LINE} threshold={60} />}
        </mesh>
      ))}
    </group>
  );
}

function WindowUnit({ z, wall, stone }: { z: number; wall: string; stone: string }) {
  const { w, y0, y1 } = WINDOW;
  const h = y1 - y0;
  const deep = 0.24;
  const x = LEFT - deep / 2;
  const fx = LEFT - deep + 0.04;
  return (
    <group>
      {/* Reveals */}
      <B s={[deep, 0.02, w]} p={[x, y0 - 0.01, z]} c={wall} />
      <B s={[deep, 0.02, w]} p={[x, y1 + 0.01, z]} c={wall} />
      <B s={[deep, h, 0.02]} p={[x, (y0 + y1) / 2, z - w / 2 - 0.01]} c={wall} />
      <B s={[deep, h, 0.02]} p={[x, (y0 + y1) / 2, z + w / 2 + 0.01]} c={wall} />
      {/* Slim bronze frame with a transom */}
      <B s={[0.04, h, 0.04]} p={[fx, (y0 + y1) / 2, z]} c={BRONZE} m={0.5} r={0.4} />
      <B s={[0.04, 0.04, w]} p={[fx, y1 - 0.5, z]} c={BRONZE} m={0.5} r={0.4} />
      <B s={[0.04, 0.05, w]} p={[fx, y0 + 0.025, z]} c={BRONZE} m={0.5} r={0.4} />
      <B s={[0.04, 0.05, w]} p={[fx, y1 - 0.025, z]} c={BRONZE} m={0.5} r={0.4} />
      <B s={[0.04, h, 0.04]} p={[fx, (y0 + y1) / 2, z - w / 2 + 0.02]} c={BRONZE} m={0.5} r={0.4} />
      <B s={[0.04, h, 0.04]} p={[fx, (y0 + y1) / 2, z + w / 2 - 0.02]} c={BRONZE} m={0.5} r={0.4} />
      {/* Stone sill */}
      <B s={[0.12, 0.03, w + 0.1]} p={[LEFT + 0.04, y0 - 0.015, z]} c={stone} r={0.45} />
    </group>
  );
}

function Fireplace({ wall, stone, plaster }: { wall: string; stone: string; plaster: THREE.Texture }) {
  const { drawing, evening } = useContext(SceneCtx);
  const R = -LEFT;
  const depth = 0.4;
  const fire = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (fire.current) fire.current.intensity = 2.4 + Math.sin(clock.elapsedTime * 9) * 0.35 + Math.sin(clock.elapsedTime * 23) * 0.25;
  });
  return (
    <group position={[0, 0, FIREPLACE_Z]}>
      <mesh position={[R - depth / 2, ROOM.h / 2, 0]} castShadow={!drawing} receiveShadow={!drawing}>
        <boxGeometry args={[depth, ROOM.h, 1.7]} />
        {drawing ? <meshBasicMaterial color="#fff" /> : <meshStandardMaterial color={wall} map={plaster} roughness={0.95} />}
        <Ed />
      </mesh>
      <B s={[0.02, 0.62, 0.95]} p={[R - depth - 0.005, 0.56, 0]} c="#1b1613" r={0.9} />
      {evening && !drawing && (
        <>
          <mesh position={[R - depth - 0.018, 0.42, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.6, 0.22]} />
            <meshBasicMaterial color="#ff8a3d" toneMapped={false} />
          </mesh>
          <pointLight ref={fire} position={[R - depth - 0.35, 0.5, 0]} intensity={2.4} distance={4.5} decay={1.5} color="#ff9a4d" />
        </>
      )}
      <B s={[0.62, 0.06, 1.9]} p={[R - 0.31, 0.03, 0]} c={stone} r={0.45} />
      <B s={[0.2, 0.06, 1.8]} p={[R - depth - 0.09, 1.18, 0]} c={stone} r={0.45} />
      {/* Artwork above the mantel */}
      <B s={[0.03, 0.82, 0.62]} p={[R - depth - 0.015, 1.86, 0]} c="#efe8dc" />
      <B s={[0.032, 0.6, 0.42]} p={[R - depth - 0.016, 1.86, 0]} c="#c28e6e" r={0.9} />
      <Cyl a={[0.05, 0.07, 0.26]} p={[R - depth - 0.09, 1.34, -0.55]} c="#ece5d9" r={0.5} />
    </group>
  );
}

/* ================================================================ Light == */

const SUN: Record<LightId, { color: string; intensity: number; sky: string; hemi: number; hemiSky: string; hemiGround: string; bg: string; exposure: number }> = {
  morning: { color: "#fff3e2", intensity: 3.4, sky: "#dfeaf3", hemi: 1.15, hemiSky: "#f5f2ec", hemiGround: "#cbbfae", bg: "#f4f1eb", exposure: 1.1 },
  golden: { color: "#ffb36b", intensity: 4.2, sky: "#f6c590", hemi: 0.9, hemiSky: "#ffe4c4", hemiGround: "#b39a80", bg: "#f3e7d8", exposure: 1.05 },
  evening: { color: "#9db1d8", intensity: 0.35, sky: "#26324b", hemi: 0.32, hemiSky: "#8394b8", hemiGround: "#3a2e26", bg: "#1a1614", exposure: 1.2 },
};

function Lights({ style }: { style: Style }) {
  const { drawing } = useContext(SceneCtx);
  const sun = SUN[style.light];
  const hasWindow = style.window !== "none";
  const exposure = drawing ? 1 : sun.exposure;
  useFrame((state) => {
    state.gl.toneMappingExposure += (exposure - state.gl.toneMappingExposure) * 0.1;
  });
  // With windows the sun comes through them (low, from the left); otherwise over the open side.
  const pos: V3 = hasWindow ? (style.light === "golden" ? [-8, 3.4, 1.2] : [-7, 6.4, 1.8]) : [-3, 7, 6];
  if (drawing) return <ambientLight intensity={1} />;
  return (
    <>
      <hemisphereLight args={[sun.hemiSky, sun.hemiGround, sun.hemi]} />
      <ambientLight intensity={style.light === "evening" ? 0.12 : 0.28} />
      <directionalLight
        position={pos}
        intensity={sun.intensity}
        color={sun.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* Sky seen through the windows */}
      {hasWindow && (
        <mesh position={[LEFT - 0.6, ROOM.h / 2, -0.3]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.8, ROOM.h + 0.6]} />
          <meshBasicMaterial color={sun.sky} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

/* =============================================================== Camera == */

const VIEWS: Record<CameraView, { pos: V3; target: V3 }> = {
  front: { pos: [0, 1.75, 7.4], target: [0, 1.1, -0.6] },
  corner: { pos: [4.7, 3.0, 5.4], target: [-0.4, 0.9, -0.6] },
  plan: { pos: [0, 10.5, 0.35], target: [0, 0, -0.1] },
};

function Rig({ view, nonce }: { view: CameraView; nonce: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const goal = useRef<(typeof VIEWS)[CameraView] | null>(VIEWS.front);
  const vPos = useMemo(() => new THREE.Vector3(), []);
  const vTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    goal.current = VIEWS[view];
  }, [view, nonce]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const stop = () => (goal.current = null);
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, []);

  useFrame((_, dt) => {
    const c = controls.current;
    const g = goal.current;
    if (!c || !g) return;
    const k = 1 - Math.exp(-dt * 4);
    vTarget.set(...g.target);
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1.6;
    const pull = Math.max(1, 1.1 / aspect);
    vPos.set(...g.pos).sub(vTarget).multiplyScalar(pull).add(vTarget);
    camera.position.lerp(vPos, k);
    c.target.lerp(vTarget, k);
    c.update();
    if (camera.position.distanceTo(vPos) < 0.01 && c.target.distanceTo(vTarget) < 0.01) goal.current = null;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2.5}
      maxDistance={20}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minAzimuthAngle={-1.3}
      maxAzimuthAngle={1.3}
      target={VIEWS.front.target}
    />
  );
}

/* ================================================================ Scene == */

function Dimensions() {
  const tag = "whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10.5px] font-medium tabular-nums text-ink/70 shadow-sm";
  return (
    <>
      <Html position={[0, 0, ROOM.d / 2 + 0.2]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span className={tag}>{Math.round(ROOM.w * 1000)} mm</span>
      </Html>
      <Html position={[-LEFT + 0.25, 0, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span className={tag}>{Math.round(ROOM.d * 1000)} mm</span>
      </Html>
      <Html position={[LEFT, ROOM.h + 0.15, BACK]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span className={tag}>h {Math.round(ROOM.h * 1000)}</span>
      </Html>
    </>
  );
}

export default function Planner3D({
  items,
  style,
  drawing,
  view,
  viewNonce,
  selected,
  onSelect,
  onMove,
  onReady,
}: {
  items: Item[];
  style: Style;
  drawing: boolean;
  view: CameraView;
  viewNonce: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onReady?: (canvas: HTMLCanvasElement) => void;
}) {
  const floor = find(FLOORS, style.floor);
  const floorTex = useMemo(() => floorTexture(floor.kind, floor.color), [floor.kind, floor.color]);
  const plaster = useMemo(() => plasterTexture(), []);
  useEffect(() => () => floorTex.dispose(), [floorTex]);

  const ctx = useMemo<Ctx>(() => ({ drawing, evening: style.light === "evening" }), [drawing, style.light]);
  const sun = SUN[style.light];

  return (
    <Canvas
      className="!absolute inset-0"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: VIEWS.front.pos, fov: 38, near: 0.05, far: 80 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => onReady?.(gl.domElement)}
      onPointerMissed={() => onSelect(null)}
    >
      <SceneCtx.Provider value={ctx}>
        <color attach="background" args={[drawing ? "#ffffff" : sun.bg]} />
        <Lights style={style} />
        <Room style={style} plaster={plaster} floorTex={floorTex} />
        {items.map((it) => (
          <Piece key={it.id} item={it} style={style} selected={selected === it.id} onSelect={onSelect} onMove={onMove} />
        ))}
        {drawing && <Dimensions />}
        <Rig view={view} nonce={viewNonce} />
      </SceneCtx.Provider>
    </Canvas>
  );
}
