"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { projects } from "@/lib/content";
import { Photo } from "./Photo";

// Photos that flash through the intro frame, last one opens to full screen.
const FRAMES = [
  projects[6].images[5],
  "/images/about-model-review.jpg",
  projects[2].images[0],
  projects[1].images[0],
  "/images/ember-lounge.jpg",
  projects[5].images[0],
  projects[8].images[1],
];

/**
 * First-visit intro: the wordmark sits above a tall frame where interiors wipe
 * up one after another while a counter climbs to 100. The final image then
 * opens to fill the screen and the page is revealed.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || sessionStorageGet("lonora-intro")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- session flag is client-only
      setDone(true);
      window.dispatchEvent(new Event("lonora:ready"));
      return;
    }
    const step = 0.38;
    const counter = { v: 0 };
    const total = FRAMES.length * step + 0.4;
    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        sessionStorageSet("lonora-intro", "1");
        setDone(true);
      },
    });
    tl.fromTo("[data-pl-logo]", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, 0)
      .fromTo("[data-pl-frame]", { clipPath: "inset(50% 0 50% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.8, ease: "expo.inOut" }, 0.1)
      .fromTo(
        "[data-pl-img]",
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "power3.inOut", stagger: step },
        0.5,
      )
      .fromTo("[data-pl-img] img", { scale: 1.25 }, { scale: 1, duration: 0.9, ease: "power2.out", stagger: step }, 0.5)
      .to(
        counter,
        {
          v: 100,
          duration: total,
          ease: "power1.inOut",
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        },
        0.3,
      )
      // Exit: text fades, the frame opens to full screen, then the curtain lifts.
      .to(["[data-pl-logo]", "[data-pl-count]"], { opacity: 0, duration: 0.4 }, ">-0.1")
      .to("[data-pl-frame]", { width: "100vw", height: "100svh", borderRadius: 0, duration: 1, ease: "expo.inOut" }, "<")
      .add(() => window.dispatchEvent(new Event("lonora:ready")), ">-0.2")
      .to(root.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, ">-0.1");
    return () => void tl.kill();
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-espresso text-cream">
      <div className="absolute left-0 right-0 top-[9svh] flex justify-center overflow-hidden">
        <span data-pl-logo className="display text-[clamp(1.4rem,2.2vw,2rem)] tracking-[0.12em] opacity-0">
          LONORA
        </span>
      </div>

      <div data-pl-frame className="relative h-[46svh] w-[min(56vw,240px)] overflow-hidden rounded-[6px] bg-white/5 md:w-[min(18vw,300px)]" style={{ clipPath: "inset(50% 0 50% 0)" }}>
        {FRAMES.map((id, i) => (
          <div key={i} data-pl-img className="absolute inset-0" style={{ clipPath: "inset(100% 0 0 0)" }}>
            <Photo id={id} alt="" sizes="(min-width: 768px) 100vw, 100vw" priority />
          </div>
        ))}
      </div>

      <div data-pl-count className="absolute bottom-[9svh] left-0 right-0 text-center text-[13px] tracking-[0.2em] text-white/60">
        <span ref={count}>000</span>
      </div>
    </div>
  );
}

function sessionStorageGet(k: string) {
  try {
    return window.sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function sessionStorageSet(k: string, v: string) {
  try {
    window.sessionStorage.setItem(k, v);
  } catch {}
}
