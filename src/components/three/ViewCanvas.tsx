"use client";

import { Canvas } from "@react-three/fiber";
import { View, Preload } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * One shared, fixed WebGL canvas behind the page. Every <RoomView> on a page
 * renders into it through drei's View (scissored viewports), so a grid of
 * live 3D project cards costs a single GL context.
 */
export default function ViewCanvas() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount / route sync
  useEffect(() => setEl(document.body), []);
  if (!el) return null;

  return (
    <Canvas
      eventSource={el}
      eventPrefix="client"
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  );
}
