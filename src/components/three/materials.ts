"use client";

import * as THREE from "three";

/*
 * Procedural textures — generated once on the client from canvas, so the 3D
 * world needs no downloaded image assets. They give plaster, stone and timber
 * the micro-variation that makes flat colours read as real materials.
 */

const cache = new Map<string, THREE.Texture>();

function canvasTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, srgb = false) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

/** Soft value noise, used as roughness / bump for plaster and stone. */
export function noiseTexture() {
  return canvasTexture("noise", 256, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    for (let i = 0; i < s * s; i++) {
      const v = 150 + Math.random() * 70;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.filter = "blur(1.2px)";
    ctx.drawImage(ctx.canvas, 0, 0);
    // larger cloudy blotches
    ctx.filter = "blur(18px)";
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},128,0.06)`;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
      ctx.beginPath();
      ctx.arc(Math.random() * s, Math.random() * s, 10 + Math.random() * 50, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function jitter(hex: string, amt: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + (Math.random() - 0.5) * amt, 0, 1));
  return `#${c.getHexString()}`;
}

/** Large-format stone slabs with fine joints. One texture tile = 4×4 slabs. */
export function slabTexture(color: string) {
  return canvasTexture(
    `slab-${color}`,
    1024,
    (ctx, s) => {
      const n = 4;
      const cell = s / n;
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          ctx.fillStyle = jitter(color, 0.05);
          ctx.fillRect(x * cell, y * cell, cell, cell);
          // veining
          ctx.globalAlpha = 0.08;
          for (let v = 0; v < 6; v++) {
            ctx.strokeStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
            ctx.lineWidth = 0.5 + Math.random() * 1.5;
            ctx.beginPath();
            ctx.moveTo(x * cell + Math.random() * cell, y * cell);
            ctx.bezierCurveTo(
              x * cell + Math.random() * cell, y * cell + cell * 0.3,
              x * cell + Math.random() * cell, y * cell + cell * 0.7,
              x * cell + Math.random() * cell, y * cell + cell,
            );
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, s);
        ctx.moveTo(0, i * cell);
        ctx.lineTo(s, i * cell);
        ctx.stroke();
      }
    },
    true,
  );
}

/** Long timber planks with grain. One tile = 8 planks across. */
export function plankTexture(color: string) {
  return canvasTexture(
    `plank-${color}`,
    1024,
    (ctx, s) => {
      const n = 8;
      const w = s / n;
      for (let i = 0; i < n; i++) {
        const base = jitter(color, 0.08);
        ctx.fillStyle = base;
        ctx.fillRect(i * w, 0, w, s);
        ctx.globalAlpha = 0.12;
        for (let g = 0; g < 26; g++) {
          ctx.strokeStyle = Math.random() > 0.4 ? "#000" : "#fff";
          ctx.lineWidth = Math.random() * 1.6;
          const x = i * w + Math.random() * w;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          for (let y = 0; y <= s; y += 64) ctx.lineTo(x + Math.sin(y * 0.01 + g) * 3, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // end joints, staggered
        const off = Math.random() * s;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(i * w, off, w, 2);
        ctx.fillRect(i * w, 0, 1.5, s);
      }
    },
    true,
  );
}

/** Vertical fluting baked into real geometry — reads beautifully in raking light. */
export function flutedColumn(radius: number, height: number, flutes = 20, depth = 0.025) {
  const g = new THREE.CylinderGeometry(radius, radius, height, flutes * 6, 1, false);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < radius * 0.5) continue; // cap centres
    const a = Math.atan2(v.z, v.x);
    const k = 1 - depth * Math.pow(Math.abs(Math.cos((a * flutes) / 2)), 0.6);
    v.x *= k;
    v.z *= k;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Wall slab with a row of arched openings, extruded for depth. */
export function arcadeGeometry(width: number, height: number, depth: number, arches: number, archW: number, archH: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();
  const gap = width / arches;
  for (let i = 0; i < arches; i++) {
    const cx = -width / 2 + gap * (i + 0.5);
    const r = archW / 2;
    const hole = new THREE.Path();
    hole.moveTo(cx - r, 0);
    hole.lineTo(cx - r, archH - r);
    hole.absarc(cx, archH - r, r, Math.PI, 0, true);
    hole.lineTo(cx + r, 0);
    hole.closePath();
    shape.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Deterministic PRNG so procedural details are stable across renders. */
export function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function lighten(hex: string | THREE.Color, amount: number) {
  const c = new THREE.Color(hex as THREE.ColorRepresentation);
  return c.lerp(new THREE.Color(amount > 0 ? "#ffffff" : "#000000"), Math.abs(amount));
}
