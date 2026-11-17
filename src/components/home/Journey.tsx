"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { chapters } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, scrollState } from "@/lib/gsap";
import { TLink } from "../Transition";

const HomeScene = dynamic(() => import("../three/HomeScene"), { ssr: false });

/**
 * The signature experience: a pinned, full-screen WebGL walk through a
 * LONORA interior. Scroll drives the camera; glass cards narrate each room.
 */
export default function Journey() {
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [sample, setSample] = useState<string | null>(null);

  useGSAP(
    () => {
      const segs = chapters.length - 1;
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          scrollState.journey = self.progress;
          const idx = Math.min(segs, Math.floor(self.progress * segs + 0.35));
          setActive(idx);
          setShowCard(self.progress > 0.035);
        },
      });

      // Hero copy dissolves as the camera starts moving.
      gsap.to(hero.current, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "6% top", scrub: true },
      });

      // Intro reveal after the preloader.
      const intro = () =>
        gsap.fromTo(
          "[data-hero-in]",
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.6, stagger: 0.08, delay: 0.3, ease: "expo.out" },
        );
      window.addEventListener("lonora:ready", intro, { once: true });
      const fallback = window.setTimeout(intro, 3400);
      return () => {
        window.removeEventListener("lonora:ready", intro);
        window.clearTimeout(fallback);
        scrollState.journey = 0;
      };
    },
    { scope: section },
  );

  // Cross-fade card content when the chapter changes.
  useEffect(() => {
    if (!card.current) return;
    gsap.fromTo(
      card.current.querySelectorAll("[data-card-in]"),
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out", overwrite: true },
    );
  }, [active]);

  useEffect(() => {
    if (!card.current) return;
    gsap.to(card.current, { autoAlpha: showCard ? 1 : 0, y: showCard ? 0 : 30, duration: 0.8, ease: "expo.out" });
  }, [showCard]);

  // Material sample hover label (set by the 3D atelier).
  useEffect(() => {
    const obs = new MutationObserver(() => setSample(document.body.dataset.sample ?? null));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-sample"] });
    return () => obs.disconnect();
  }, []);

  const ch = chapters[active];

  return (
    <section ref={section} className="relative" style={{ height: `${chapters.length * 110 + 40}vh` }} aria-label="A walk through a LONORA interior">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-espresso">
        <div className="absolute inset-0">
          <HomeScene />
        </div>

        {/* readability gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.45)_0%,rgba(12,9,7,0)_28%,rgba(12,9,7,0)_55%,rgba(12,9,7,0.6)_100%)]" />

        {/* Hero */}
        <div ref={hero} className="pointer-events-none absolute inset-x-0 bottom-0 wrap pb-10 md:pb-14">
          <div className="pointer-events-auto max-w-[1100px]">
            <div className="overflow-hidden">
              <p data-hero-in className="eyebrow mb-5 text-cream [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]">
                Interior architecture studio
              </p>
            </div>
            <h1 className="display display-lg text-bone">
              <span className="block overflow-hidden">
                <span data-hero-in className="block">Interiors composed</span>
              </span>
              <span className="block overflow-hidden">
                <span data-hero-in className="block">like architecture</span>
              </span>
            </h1>
            <div className="overflow-hidden">
              <p data-hero-in className="lede mt-6 max-w-[520px] text-white/75">
                Residential and commercial spaces shaped by light, proportion and material. Scroll to walk through one.
              </p>
            </div>
            <div className="overflow-hidden pt-8">
              <div data-hero-in className="flex flex-wrap gap-3">
                <TLink href="/projects" className="btn btn-solid">
                  Explore our work
                </TLink>
                <TLink href="/contact" className="btn btn-ghost text-bone">
                  Book a consultation
                </TLink>
              </div>
            </div>
          </div>
          <div className="glass pointer-events-auto absolute bottom-14 right-[var(--gutter)] hidden gap-8 rounded-2xl px-6 py-4 text-[12.5px] lg:flex">
            {[
              ["Practice", "Interior architecture"],
              ["Sectors", "Residential · Commercial"],
              ["Also", "3D visualisation"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-white/45">{k}</p>
                <p className="text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter card */}
        <div
          ref={card}
          className="glass invisible absolute bottom-6 left-4 right-4 rounded-2xl p-5 text-bone opacity-0 md:bottom-auto md:left-auto md:right-[var(--gutter)] md:top-1/2 md:w-[380px] md:-translate-y-1/2 md:p-6"
        >
          <p data-card-in className="text-[12.5px] text-white/55">
            {ch.index} / {String(chapters.length).padStart(2, "0")}
          </p>
          <h2 data-card-in className="display mt-2 text-[24px] md:text-[28px]">
            {ch.title}
          </h2>
          <p data-card-in className="mt-3 text-[14px] leading-relaxed text-white/70">
            {ch.text}
          </p>
          <div data-card-in className="mt-5 grid grid-cols-3 gap-2">
            {ch.stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.06] px-3 py-2.5">
                <p className="text-[11px] text-white/45">{s.label}</p>
                <p className="mt-0.5 text-[14px]">{s.value}</p>
              </div>
            ))}
          </div>
          {active === chapters.length - 1 && (
            <div data-card-in className="mt-5 flex items-center justify-between gap-3">
              <span className="font-[family-name:var(--font-hand)] text-[22px] text-terracotta">
                {sample ? sample : "hover the samples"}
              </span>
              <TLink href="/projects" className="btn btn-solid h-10 text-[13px]">
                See the work
              </TLink>
            </div>
          )}
          <div className="mt-5 flex gap-1.5">
            {chapters.map((c, i) => (
              <span key={c.index} className="h-[2px] flex-1 overflow-hidden rounded bg-white/15">
                <span
                  className="block h-full bg-terracotta transition-transform duration-700 ease-[var(--ease-out-expo)]"
                  style={{ transform: `scaleX(${i <= active ? 1 : 0})`, transformOrigin: "left" }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* chapter label (hidden on the opening hero) */}
        {showCard && (
          <div className="pointer-events-none absolute left-1/2 top-[calc(var(--header-h)+12px)] hidden -translate-x-1/2 text-[11.5px] uppercase tracking-[0.16em] text-white/50 md:block">
            {ch.index} — {ch.title}
          </div>
        )}
      </div>
    </section>
  );
}
