"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { RoomPreset } from "@/lib/content";
import { Contents, Mat, ROOM_H, ROOM_W, Shell, Sun } from "./Room";
import { lighten } from "./materials";

const LENGTH: Record<RoomPreset["layout"], number> = {
  living: 14,
  gallery: 20,
  arch: 12,
  loft: 18,
  court: 16,
};

/** One complete project interior: shell, contents, sun, reflections. */
export function Interior({ preset, quality = "low" }: { preset: RoomPreset; quality?: "high" | "low" }) {
  const length = LENGTH[preset.layout];
  const skylightZ = preset.layout === "court" ? -8 : undefined;
  const fogColor = lighten(preset.ambient, -0.55);

  return (
    <>
      <fog attach="fog" args={[fogColor, 14, 46]} />
      <Shell preset={preset} length={length} quality={quality} skylightZ={skylightZ} />
      <Contents layout={preset.layout} preset={preset} quality={quality} length={length} skylightZ={skylightZ} />
      {preset.layout !== "arch" && preset.layout !== "living" && (
        <mesh position={[0, ROOM_H / 2, -length - 0.15]} receiveShadow>
          <boxGeometry args={[ROOM_W + 0.6, ROOM_H, 0.3]} />
          <Mat color={preset.wall} />
        </mesh>
      )}
      <Sun preset={preset} center={-length / 2} mapSize={quality === "high" ? 2048 : 1024} height={preset.layout === "court" ? 14 : 9} />
      {skylightZ !== undefined && (
        <spotLight
          position={[1.5, 12, skylightZ + 1]}
          angle={0.3}
          penumbra={0.4}
          intensity={180}
          color={preset.sun}
          castShadow
          shadow-mapSize={[1024, 1024]}
          target-position={[0, 0, skylightZ]}
        />
      )}
      <ambientLight intensity={0.12} color={preset.ambient} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color={preset.sun} position={[10, 3, -6]} rotation-y={-Math.PI / 2} scale={[30, 5, 1]} />
        <Lightformer form="rect" intensity={0.6} color={preset.ambient} position={[0, 8, -6]} rotation-x={Math.PI / 2} scale={[12, 30, 1]} />
        <Lightformer form="rect" intensity={0.3} color={preset.wall} position={[-10, 2, -6]} rotation-y={Math.PI / 2} scale={[30, 5, 1]} />
      </Environment>
    </>
  );
}

/** Camera presets that frame each layout well. [position, target] */
export const ROOM_SHOTS: Record<RoomPreset["layout"], [number, number, number][][]> = {
  living: [
    [[4.6, 1.8, -3.2], [0.2, 0.9, -9.4]],
    [[-2.6, 1.3, -5.2], [1.6, 0.8, -10]],
    [[3.8, 2.6, -11.5], [-2, 0.6, -7]],
  ],
  gallery: [
    [[0.4, 1.7, 1.5], [0, 1.9, -16]],
    [[-1.6, 1.4, -4], [-4.8, 1.2, -9]],
    [[2.4, 3.2, -15], [-1, 0.6, -5]],
  ],
  arch: [
    [[2.6, 1.7, -1], [-0.4, 1.6, -12]],
    [[-3.4, 1.2, -4], [-0.2, 1.6, -14]],
    [[3.8, 2.2, -8.8], [0, 0.8, -6]],
  ],
  loft: [
    [[4.4, 1.7, -2], [-1, 1, -11]],
    [[-1.4, 1.6, -4], [-3.6, 1.2, -12]],
    [[5, 2.1, -14.5], [1.4, 0.6, -9]],
  ],
  court: [
    [[3.2, 1.8, -0.5], [-0.2, 1.4, -9]],
    [[-3, 2.8, -3], [0.4, 0.4, -9]],
    [[3.6, 1.4, -13], [-0.8, 2, -6]],
  ],
};
