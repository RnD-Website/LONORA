"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Pinned film moment: a small rounded window into the interior film grows to
 * fill the screen as you scroll, while the headline parts to either side.
 */
export function VideoReveal() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" },
        (ctx) => {
          const desktop = ctx.conditions?.desktop;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${window.innerHeight * (desktop ? 1.6 : 1.1)}`,
              pin: "[data-stage]",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(
            "[data-frame]",
            { clipPath: desktop ? "inset(36% 35% 36% 35% round 40px)" : "inset(38% 16% 38% 16% round 28px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 },
          )
            .fromTo("[data-film]", { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
            .to("[data-word=t]", { y: () => -window.innerHeight * 0.3, opacity: 0, duration: 0.7 }, 0)
            .to("[data-word=b]", { y: () => window.innerHeight * 0.3, opacity: 0, duration: 0.7 }, 0)
            .to("[data-word=l]", { x: () => -window.innerWidth * 0.25, opacity: 0, duration: 0.7 }, 0)
            .to("[data-word=r]", { x: () => window.innerWidth * 0.25, opacity: 0, duration: 0.7 }, 0)
            .fromTo("[data-caption] > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.35 }, 0.7);
        },
      );
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative bg-cream text-ink">
      <div data-stage className="relative h-[100svh] overflow-hidden">
        <div data-frame className="absolute inset-0 overflow-hidden [clip-path:inset(36%_35%_36%_35%_round_40px)] max-md:[clip-path:inset(38%_16%_38%_16%_round_28px)]">
          <video
            data-film
            className="h-full w-full object-cover will-change-transform"
            src="/video/lonora-dining.mp4"
            poster="/video/lonora-dining-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="A LONORA dining room overlooking the city at golden hour"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.15)_0%,rgba(12,9,7,0)_40%,rgba(12,9,7,0.55)_100%)]" />
        </div>

        {/* Four words framing the film; they drift outward as it opens */}
        <div className="pointer-events-none absolute inset-0 display text-[clamp(2.4rem,5.6vw,6.2rem)] leading-none">
          <span data-word="t" className="absolute bottom-[calc(64%+3svh)] left-1/2 -translate-x-1/2 max-md:bottom-[calc(62%+2svh)]">
            <span className="block">Material</span>
          </span>
          <span data-word="b" className="absolute left-1/2 top-[calc(64%+3svh)] -translate-x-1/2 max-md:top-[calc(62%+2svh)]">
            <span className="block">Texture</span>
          </span>
          <span data-word="l" className="absolute right-[calc(65%+4vw)] top-1/2 -translate-y-1/2 max-md:hidden">
            <span className="block">Light</span>
          </span>
          <span data-word="r" className="absolute left-[calc(65%+4vw)] top-1/2 -translate-y-1/2 max-md:hidden">
            <span className="block">Detail</span>
          </span>
        </div>

        <div data-caption className="absolute inset-x-0 bottom-0 grid gap-4 px-[var(--gutter)] pb-10 text-bone md:grid-cols-12 md:items-end md:pb-14">
                    <p className="display text-[clamp(2.4rem,4.6vw,4.8rem)] leading-[0.98] opacity-0 md:col-span-8">
            Composed
            <br />
            for living.
          </p>
          <p className="max-w-[300px] text-[14px] leading-relaxed text-white/75 opacity-0 md:col-span-4 md:col-start-9 md:justify-self-end md:pb-2">
            Every room starts with how it will feel at four in the afternoon.
          </p>
        </div>
      </div>
    </section>
  );
}
