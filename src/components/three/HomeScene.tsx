"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { RoomPreset } from "@/lib/content";
import { scrollState } from "@/lib/gsap";
import { Contents, Mat, ROOM_H, ROOM_W, Shell, Sun } from "./Room";
import { arcadeGeometry, lighten, noiseTexture, plankTexture } from "./materials";

export const HOME_PRESET: RoomPreset = {
  layout: "gallery",
  wall: "#E7DDCB",
  floor: "#CBB896",
  accent: "#8C6A43",
  fabric: "#EEE5D6",
  sun: "#FFD6A6",
  sunIntensity: 3.4,
  ambient: "#F2E8D4",
  floorGloss: 0.5,
};

const LENGTH = 70;
const SKYLIGHT_Z = -44;

/*
 * Camera keyframes — one per chapter. The journey hits each exactly, holding
 * briefly so the overlay copy can be read, then glides to the next.
 */
const KEYS: { pos: [number, number, number]; look: [number, number, number] }[] = [
  { pos: [0, 1.75, 13], look: [0, 2.1, 0] },
  { pos: [0.3, 1.8, -4.5], look: [-1.4, 1.6, -18] },
  { pos: [3.1, 1.7, -22.4], look: [0, 0.9, -29.8] },
  { pos: [-3.2, 2.3, -36.2], look: [0.6, 1.3, -45.5] },
  { pos: [0, 1.75, -55.5], look: [0, 1.65, -63] },
];

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function CameraRig({ intro }: { intro: boolean }) {

  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal"), []);
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k.look)), false, "centripetal"), []);
  const smooth = useRef(0);
  const introZ = useRef(8);
  const p = useMemo(() => new THREE.Vector3(), []);
  const l = useMemo(() => new THREE.Vector3(), []);
  const look = useRef(new THREE.Vector3(...KEYS[0].look));

  useFrame(({ camera, size }, dt) => {
    const d = Math.min(dt, 0.05);
    // Portrait screens get a wider vertical FOV so rooms still read.
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fov = aspect < 0.8 ? 64 : aspect < 1.2 ? 54 : 46;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    smooth.current = THREE.MathUtils.damp(smooth.current, scrollState.journey, 2.4, d);
    introZ.current = THREE.MathUtils.damp(introZ.current, intro ? 0 : 8, 1.4, d);

    // Stepped progress: hold at each key for the first 22% of its segment.
    const segs = KEYS.length - 1;
    const s = THREE.MathUtils.clamp(smooth.current, 0, 1) * segs;
    const i = Math.min(Math.floor(s), segs - 1);
    const u = s - i;
    const eased = easeInOut(THREE.MathUtils.clamp((u - 0.22) / 0.78, 0, 1));
    const t = (i + eased) / segs;

    posCurve.getPoint(t, p);
    lookCurve.getPoint(t, l);

    const px = scrollState.pointer.x;
    const py = scrollState.pointer.y;
    camera.position.set(p.x + px * 0.35, p.y - py * 0.15, p.z + introZ.current);
    look.current.lerp(l.set(l.x + px * 0.9, l.y - py * 0.4, l.z), 1 - Math.exp(-4 * d));
    camera.lookAt(look.current);
  });
  return null;
}

/** The arrival: a thick stone wall pierced by one tall arch. */
function Portal({ preset }: { preset: RoomPreset }) {
  const geo = useMemo(() => arcadeGeometry(ROOM_W + 8, ROOM_H + 9, 1.2, 1, 3.2, 4.4), []);
  return (
    <mesh geometry={geo} position={[0, 0, 0.6]} castShadow receiveShadow>
      <Mat color={lighten(preset.wall, -0.04)} bump={0.04} />
    </mesh>
  );
}

const SAMPLES = [
  { name: "Travertine", color: "#D9C7A8", rough: 0.7, metal: 0 },
  { name: "Smoked oak", color: "#6B4F3A", rough: 0.6, metal: 0, plank: true },
  { name: "Bronze", color: "#8C6A43", rough: 0.3, metal: 0.95 },
  { name: "Lime plaster", color: "#EDE5D6", rough: 0.95, metal: 0 },
  { name: "Verde marble", color: "#4D5547", rough: 0.15, metal: 0 },
  { name: "Terracotta", color: "#C9805E", rough: 0.9, metal: 0 },
];

function Sample({ i, s }: { i: number; s: (typeof SAMPLES)[number] }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const n = SAMPLES.length;
  const a = ((i - (n - 1) / 2) / n) * 1.9;
  const base = useMemo(() => new THREE.Vector3(Math.sin(a) * 3.2, 1.7 + (i % 2) * 0.35, -62.5 - Math.cos(a) * 1.4 + 1.4), [a, i]);
  const map = useMemo(() => (s.plank ? plankTexture(s.color) : null), [s]);

  useFrame(({ clock, camera }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime + i;
    g.position.set(base.x, base.y + Math.sin(t * 0.9) * 0.08, base.z);
    const targetY = hover ? Math.atan2(camera.position.x - base.x, camera.position.z - base.z) : Math.sin(t * 0.4) * 0.6 - a;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, hover ? 0 : Math.sin(t * 0.5) * 0.15, 4, dt);
    const sc = THREE.MathUtils.damp(g.scale.x, hover ? 1.18 : 1, 6, dt);
    g.scale.setScalar(sc);
  });

  return (
    <group ref={ref}>
      <RoundedBox
        args={[0.75, 1, 0.07]}
        radius={0.02}
        smoothness={3}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.dataset.sample = s.name;
        }}
        onPointerOut={() => {
          setHover(false);
          delete document.body.dataset.sample;
        }}
      >
        <meshStandardMaterial
          color={s.plank ? "#ffffff" : s.color}
          map={map}
          roughness={s.rough}
          metalness={s.metal}
          roughnessMap={noiseTexture()}
          bumpMap={noiseTexture()}
          bumpScale={0.02}
        />
      </RoundedBox>
    </group>
  );
}

function Atelier({ preset }: { preset: RoomPreset }) {
  return (
    <group>
      {SAMPLES.map((s, i) => (
        <Sample key={s.name} i={i} s={s} />
      ))}
      {/* long work table */}
      <mesh position={[0, 0.82, -65.5]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.08, 1.4]} />
        <Mat color={lighten(preset.wall, 0.06)} rough={0.5} />
      </mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 0.39, -65.5]} castShadow>
          <boxGeometry args={[0.12, 0.78, 1.1]} />
          <Mat color={preset.accent} rough={0.4} metal={0.7} />
        </mesh>
      ))}
      <pointLight position={[0, 3.2, -63]} color={preset.sun} intensity={6} distance={9} />
      <mesh position={[0, ROOM_H / 2, -LENGTH - 0.15]} receiveShadow>
        <boxGeometry args={[ROOM_W + 0.6, ROOM_H, 0.3]} />
        <Mat color={preset.wall} />
      </mesh>
    </group>
  );
}

function World({ quality }: { quality: "high" | "low" }) {
  const preset = HOME_PRESET;
  const living: RoomPreset = { ...preset, layout: "living", fabric: "#E9DFCF" };
  return (
    <>
      <color attach="background" args={["#17110d"]} />
      <fog attach="fog" args={["#1d1611", 16, 52]} />
      <Portal preset={preset} />
      <Shell preset={preset} length={LENGTH} quality={quality} skylightZ={SKYLIGHT_Z} />
      <Contents layout="gallery" preset={preset} quality={quality} length={20} />
      <group>
        <Contents layout="living" preset={living} quality={quality} z={-20} partition={false} />
      </group>
      <Contents layout="court" preset={{ ...preset, layout: "court" }} quality={quality} z={-36} skylightZ={-8} />
      <Atelier preset={preset} />

      <Sun preset={preset} follow mapSize={quality === "high" ? 2048 : 1024} />
      <spotLight
        position={[1.5, 13, SKYLIGHT_Z + 1]}
        angle={0.28}
        penumbra={0.5}
        intensity={200}
        color={preset.sun}
        castShadow
        shadow-mapSize={[1024, 1024]}
        target-position={[0, 0, SKYLIGHT_Z]}
      />
      <ambientLight intensity={0.1} color={preset.ambient} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color={preset.sun} position={[12, 3, -30]} rotation-y={-Math.PI / 2} scale={[80, 5, 1]} />
        <Lightformer form="rect" intensity={0.5} color={preset.ambient} position={[0, 9, -30]} rotation-x={Math.PI / 2} scale={[12, 80, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 6, 6]} scale={4} />
      </Environment>
    </>
  );
}

export default function HomeScene() {
  const [intro, setIntro] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [dpr, setDpr] = useState(1.25);
  const [effects, setEffects] = useState(true);

  useEffect(() => {
    const go = () => setIntro(true);
    window.addEventListener("lonora:ready", go);
    const fallback = window.setTimeout(go, 3200);
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (small) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- viewport is client-only
      setQuality("low");
      setDpr(1.25);
    }
    return () => {
      window.removeEventListener("lonora:ready", go);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 46, near: 0.1, far: 90, position: [0, 1.75, 21] }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setEffects(false);
        }}
        flipflops={2}
      />
      <CameraRig intro={intro} />
      <World quality={quality} />
      {effects ? (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={1.2} intensity={2.2} distanceFalloff={1.2} quality="performance" halfRes />
          <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.25} darkness={0.6} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.25} darkness={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
