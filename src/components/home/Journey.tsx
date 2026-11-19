"use client";

import { useEffect, useRef, useState } from "react";
import { chapters } from "@/lib/content";
import { gsap, ScrollTrigger, useGSAP, scrollState } from "@/lib/gsap";
import { TLink } from "../Transition";

import HeroVideo from "./HeroVideo";

/**
 * The signature experience: a pinned, full-screen film that walks from the
 * street into a LONORA interior. Scroll drives the playhead in both
 * directions; glass cards narrate each chapter.
 */
export default function Journey() {
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [showCard, setShowCard] = useState(false);

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

      // The hero's soft shade leaves with the copy.
      gsap.to(shade.current, {
        opacity: 0,
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

  const ch = chapters[active];

  return (
    <section ref={section} className="relative" style={{ height: `${chapters.length * 110 + 40}vh` }} aria-label="A walk through a LONORA interior">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-espresso">
        {/* Scroll-scrubbed film: plays forward on scroll down, reverses on scroll up */}
        <div className="pointer-events-none absolute inset-0">
          <HeroVideo />
        </div>

        {/* readability gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.45)_0%,rgba(12,9,7,0)_28%,rgba(12,9,7,0)_55%,rgba(12,9,7,0.6)_100%)]" />

        {/* Hero shade: a warm gradient behind the opening copy (first view only) */}
        <div
          ref={shade}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_100%,rgba(23,17,13,0.82)_0%,rgba(23,17,13,0.55)_35%,rgba(23,17,13,0)_70%)]"
        />

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
        </div>

        {/* Chapter card */}
        <div
          ref={card}
          className="glass invisible absolute bottom-6 left-4 right-4 rounded-2xl p-5 text-bone opacity-0 md:bottom-0 md:left-auto md:right-[var(--gutter)] md:top-0 md:my-auto md:h-fit md:w-[380px] md:p-6"
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
            <div data-card-in className="mt-5 flex items-center justify-end gap-3">
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
