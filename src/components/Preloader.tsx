"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** First-visit intro: counter climbs while the wordmark assembles. */
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
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorageSet("lonora-intro", "1");
        setDone(true);
      },
    });
    tl.from("[data-pl-letter]", { yPercent: 110, stagger: 0.06, duration: 1.2, ease: "expo.out" }, 0)
      .to(counter, {
        v: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      }, 0)
      .to("[data-pl-letter]", { yPercent: -110, stagger: 0.04, duration: 0.8, ease: "expo.in" }, 2.1)
      .add(() => window.dispatchEvent(new Event("lonora:ready")), 2.6)
      .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, 2.6);
    return () => void tl.kill();
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-espresso text-cream"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="flex overflow-hidden">
        {"LONORA".split("").map((c, i) => (
          <span key={i} data-pl-letter className="display block text-[16vw] leading-none md:text-[9vw]">
            {c}
          </span>
        ))}
      </div>
      <div className="absolute bottom-8 left-[var(--gutter)] right-[var(--gutter)] flex justify-between text-[12.5px] uppercase tracking-[0.14em] text-white/50">
        <span>Interior architecture</span>
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
