"use client";

import { useEffect, useRef, useState } from "react";
import { scrollState } from "@/lib/gsap";

/**
 * Scroll-scrubbed hero film. The playhead follows the journey's scroll progress
 * (forward on scroll down, backward on scroll up) with a light damping so both
 * directions feel identical. The file is fetched whole into a blob so every seek
 * is local, and it is encoded with a keyframe every 4 frames for clean reverse seeks.
 */
export const VIDEO_END = 0.97; // journey progress at which the film reaches its last frame (holds briefly at the end)

const SRC_DESKTOP = "/video/header-1080.mp4";
const SRC_MOBILE = "/video/header-540.mp4";
const POSTER = "/video/header-poster.jpg";

export default function HeroVideo({ active = true }: { active?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Load the whole file so seeking never waits on the network.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const small = window.matchMedia("(max-width: 767px)").matches || conn?.saveData;
    const url = small ? SRC_MOBILE : SRC_DESKTOP;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(url)
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(b);
        setSrc(objectUrl);
      })
      .catch(() => !cancelled && setSrc(url));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Scrub loop.
  useEffect(() => {
    const v = video.current;
    if (!v || !src) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let shown = 0; // smoothed playhead, seconds
    let last = performance.now();
    let seeking = false;
    const onSeeked = () => {
      seeking = false;
    };
    v.addEventListener("seeked", onSeeked);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!activeRef.current || !v.duration) return;
      const target = Math.min(1, Math.max(0, scrollState.journey / VIDEO_END)) * (v.duration - 0.05);
      // Same exponential ease in both directions.
      shown = reduced ? target : shown + (target - shown) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - shown) < 0.004) shown = target;
      if (!seeking && Math.abs(v.currentTime - shown) > 1 / 60) {
        seeking = true;
        v.currentTime = shown;
      }
    };
    const start = () => {
      v.pause();
      shown = Math.min(1, scrollState.journey / VIDEO_END) * (v.duration - 0.05);
      v.currentTime = shown;
      setReady(true);
      raf = requestAnimationFrame(tick);
    };
    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadedmetadata", start);
    };
  }, [src]);

  return (
    <div className="absolute inset-0 bg-espresso">
      {/* eslint-disable-next-line @next/next/no-img-element -- instant first paint before the film loads */}
      <img src={POSTER} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      {src && (
        <video
          ref={video}
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
}
