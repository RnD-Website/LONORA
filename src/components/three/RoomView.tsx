"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import type { RoomPreset } from "@/lib/content";
import { Interior, ROOM_SHOTS } from "./Interior";
import { scrollState } from "@/lib/gsap";

type Props = {
  preset: RoomPreset;
  shot?: number;
  className?: string;
  /** "drift": slow cinematic dolly; "look": drag/pointer to look around */
  mode?: "drift" | "look" | "still";
  fov?: number;
  quality?: "high" | "low";
  hovered?: boolean;
  /**
   * Render into its own canvas inside the frame instead of the shared fixed
   * canvas, so the frame's CSS border-radius clips it exactly.
   */
  standalone?: boolean;
};

function Rig({ preset, shot = 0, mode = "drift", fov = 42, hovered }: Props) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const [pos, target] = ROOM_SHOTS[preset.layout][shot % 3];
  const look = useRef(new THREE.Vector3(...target));
  const t = useRef(shot * 3.7 + preset.wall.charCodeAt(2));

  useFrame((_, dt) => {
    const c = cam.current;
    if (!c) return;
    t.current += dt * (hovered ? 0.6 : 0.18);
    const k = t.current;
    const px = scrollState.pointer.x;
    const py = scrollState.pointer.y;
    let x = pos[0];
    let y = pos[1];
    let z = pos[2];
    if (mode === "drift") {
      x += Math.sin(k * 0.5) * 0.5;
      z += Math.sin(k * 0.3) * 0.6 - (hovered ? 0.8 : 0);
      y += Math.sin(k * 0.4) * 0.08;
    }
    if (mode === "look") {
      x += px * 0.8;
      y -= py * 0.3;
    }
    c.position.x = THREE.MathUtils.damp(c.position.x, x, 2.5, dt);
    c.position.y = THREE.MathUtils.damp(c.position.y, y, 2.5, dt);
    c.position.z = THREE.MathUtils.damp(c.position.z, z, 2.5, dt);
    const tx = target[0] + (mode === "look" ? px * 2.4 : 0);
    const ty = target[1] - (mode === "look" ? py * 1.2 : 0);
    look.current.x = THREE.MathUtils.damp(look.current.x, tx, 2, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, ty, 2, dt);
    look.current.z = target[2];
    c.lookAt(look.current);
  });

  return <PerspectiveCamera ref={cam} makeDefault fov={fov} position={pos} near={0.1} far={80} />;
}

/**
 * The shared canvas is one fixed layer, so CSS border-radius can't clip a view.
 * This paints the four corners in the surrounding background colour instead,
 * matching the parent frame's radius automatically.
 */
function CornerMask() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const frame = el?.parentElement;
    if (!el || !frame) return;
    const apply = () => {
      const r = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;
      let bg = "transparent";
      for (let n = frame.parentElement; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c)) {
          bg = c;
          break;
        }
      }
      el.style.setProperty("--r", `${r}px`);
      el.style.setProperty("--bg", bg);
      el.style.display = r > 0 ? "" : "none";
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);
  const corner = "absolute h-[var(--r)] w-[var(--r)]";
  const g = (at: string) => ({ background: `radial-gradient(circle at ${at}, transparent calc(var(--r) - 0.5px), var(--bg) var(--r))` });
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[3]">
      <span className={`${corner} left-0 top-0`} style={g("100% 100%")} />
      <span className={`${corner} right-0 top-0`} style={g("0 100%")} />
      <span className={`${corner} bottom-0 left-0`} style={g("100% 0")} />
      <span className={`${corner} bottom-0 right-0`} style={g("0 0")} />
    </div>
  );
}

/** A live 3D interior that tracks a DOM rectangle. */
export default function RoomView(props: Props) {
  if (props.standalone) {
    return (
      <Canvas
        className={props.className ?? "!absolute inset-0"}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
      >
        <Rig {...props} />
        <Interior preset={props.preset} quality={props.quality ?? "low"} />
      </Canvas>
    );
  }
  return (
    <>
      <View className={props.className ?? "absolute inset-0"}>
        <Rig {...props} />
        <Interior preset={props.preset} quality={props.quality ?? "low"} />
      </View>
      <CornerMask />
    </>
  );
}
