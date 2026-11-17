"use client";

import { useEffect, useRef } from "react";
import { posts, projects, services } from "@/lib/content";
import { gsap, SplitText, useGSAP, prefersReducedMotion, scrollState } from "@/lib/gsap";
import { RevealGroup, SplitReveal } from "../Reveal";
import { TLink } from "../Transition";
import ProjectCard from "../ProjectCard";
import { Photo } from "../Photo";

/* ---------------------------------------------------------------- Manifesto -- */

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const split = SplitText.create("[data-words]", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: "[data-words]", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-cream py-32 text-ink md:py-44">
      <div className="wrap grid gap-10 md:grid-cols-12">
        <p className="eyebrow md:col-span-3">The studio</p>
        <div className="md:col-span-9">
          <p data-words className="display display-md leading-[1.08]">
            We design interiors the way architects design buildings: starting with light, proportion and the way people move,
            then refining every surface until the space feels inevitable.
          </p>
          <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              ["Light first", "Every plan begins with a study of where the sun falls, hour by hour."],
              ["Fewer, finer materials", "Three or four materials, used generously, for calm and lasting rooms."],
              ["Seen before built", "Real-time 3D lets you walk your space before a wall is moved."],
            ].map(([t, d], i) => (
              <div key={t} data-reveal data-delay={i * 0.1} className="border-t border-ink/15 pt-5">
                <p className="text-[17px] font-medium">{t}</p>
                <p className="mt-2 text-[14.5px] text-ink/60">{d}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Selected work -- */

export function WorkRail() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);

  // Endless auto-scroll: the track drifts left, speeds up a touch with page
  // scroll velocity and eases to a near stop while a card is hovered.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let speed = 1;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      const target = hovering.current ? 0.06 : 1 + Math.min(Math.abs(scrollState.velocity) * 0.08, 3);
      speed += (target - speed) * 0.06;
      x -= speed * dt * 0.055;
      const loopAt = (el.querySelector<HTMLElement>("[data-loop-start]")?.offsetLeft ?? 0) - el.offsetLeft;
      if (loopAt > 0 && -x >= loopAt) x += loopAt;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  const featured = projects.slice(0, 6);
  const loop = [...featured, ...featured];

  return (
    <section ref={section} className="relative overflow-hidden bg-[#311414] py-28 text-bone md:py-36">
      <div className="wrap mb-12 flex items-end justify-between gap-6 md:mb-16">
        <SplitReveal className="display display-lg">Selected work</SplitReveal>
        <TLink href="/projects" className="btn btn-ghost shrink-0">
          All projects
        </TLink>
      </div>
      <div
        ref={track}
        className="relative z-[2] flex w-max items-start gap-5 pl-[var(--gutter)] will-change-transform md:gap-8"
        onMouseLeave={() => (hovering.current = false)}
      >
        {loop.map((p, i) => (
          <div
            key={`${p.slug}-${i}`}
            data-loop-start={i === featured.length ? "" : undefined}
            onMouseEnter={() => (hovering.current = true)}
            className="w-[72vw] shrink-0 transition-[width] duration-[900ms] ease-[var(--ease-out-expo)] sm:w-[42vw] md:w-[26vw] md:hover:w-[38vw]"
            aria-hidden={i >= featured.length || undefined}
          >
            <ProjectCard project={p} index={i % featured.length} aspect="h-[92vw] sm:h-[54vw] md:h-[min(62svh,34vw)]" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Services -- */

// Floating card layout (desktop): left %, top in vh within the tall section, width vw, parallax speed.
const SERVICE_CARDS: { left: number; top: number; w: number; speed: number; img: () => string }[] = [
  { left: 2, top: 26, w: 11, speed: 0.6, img: () => projects[0].images[0] },
  { left: 17, top: 62, w: 13, speed: 1.1, img: () => projects[2].images[0] },
  { left: 84, top: 38, w: 13, speed: 0.9, img: () => projects[1].images[0] },
  { left: 41, top: 108, w: 17, speed: 1.35, img: () => projects[5].images[0] },
  { left: 63, top: 150, w: 16, speed: 0.8, img: () => projects[6].images[1] },
  { left: 6, top: 168, w: 14, speed: 1.2, img: () => projects[4].images[0] },
  { left: 80, top: 205, w: 14, speed: 1, img: () => projects[9].images[0] },
];

function ServiceCard({ s, i, className = "", style }: { s: (typeof services)[number]; i: number; className?: string; style?: React.CSSProperties }) {
  const c = SERVICE_CARDS[i % SERVICE_CARDS.length];
  return (
    <TLink
      href={`/services#${s.slug}`}
      data-cursor="View"
      data-svc-card
      data-speed={c.speed}
      className={`group block ${className}`}
      style={style}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-ink/10">
        <Photo
          id={c.img()}
          alt={`${s.title} by LONORA`}
          sizes="(min-width: 768px) 18vw, 50vw"
          className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 p-4 text-center text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:opacity-100 max-md:justify-end max-md:bg-gradient-to-t max-md:from-black/70 max-md:to-transparent">
          <span className="display text-[clamp(1.1rem,1.8vw,1.9rem)] leading-[1.05] translate-y-3 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
            {s.title}
          </span>
          <span className="mt-2 hidden text-[11.5px] leading-snug text-white/75 md:block">{s.short}</span>
          <span className="mt-3 rounded-[3px] bg-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur">
            {s.index} · View
          </span>
        </div>
      </div>
    </TLink>
  );
}

export function ServicesList() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-svc-card]").forEach((card) => {
          const speed = Number(card.dataset.speed ?? 1);
          gsap.fromTo(
            card,
            { y: 120 * speed },
            {
              y: -260 * speed,
              ease: "none",
              scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
        gsap.from("[data-svc-side]", {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 1.2,
          scrollTrigger: { trigger: section.current, start: "top 60%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative bg-bone text-ink md:h-[280vh]">
      {/* column grid lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {[25, 50, 75].map((x) => (
          <span key={x} className="absolute inset-y-0 w-px bg-ink/[0.07]" style={{ left: `${x}%` }} />
        ))}
      </div>

      {/* Desktop: floating parallax cards */}
      <div className="absolute inset-0 hidden md:block">
        {services.map((s, i) => {
          const c = SERVICE_CARDS[i];
          return (
            <ServiceCard
              key={s.slug}
              s={s}
              i={i}
              className="absolute z-[2]"
              style={{ left: `${c.left}%`, top: `${c.top}vh`, width: `${c.w}vw` }}
            />
          );
        })}
      </div>

      {/* Sticky composition: title centre, notes left and right (blends over the photos) */}
      <div className="pointer-events-none sticky top-0 z-[3] hidden h-[100svh] text-white mix-blend-difference md:block">
        <div className="absolute left-1/2 top-[18vh] w-[30vw] -translate-x-1/2 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em]">[ What we do ]</p>
          <h2 className="display mt-5 text-[clamp(2.2rem,4.2vw,4.4rem)] leading-[0.98]">
            Seven disciplines,
            <br />
            one studio.
          </h2>
        </div>
        <p data-svc-side className="absolute left-[var(--gutter)] top-[52vh] max-w-[19vw] text-[14px] leading-relaxed text-white/70">
          We begin with how a space should work, refine how it should feel, and carry every decision through to the last detail on site.
        </p>
        <p data-svc-side className="absolute right-[var(--gutter)] top-[22vh] max-w-[19vw] text-[14px] leading-relaxed text-white/70">
          Interior design, planning, furniture, visualisation and renovation under one roof. Hover a frame to explore a discipline.
        </p>
      </div>

      {/* Mobile: heading + grid */}
      <div className="py-24 wrap md:hidden">
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-ink/60">[ What we do ]</p>
        <SplitReveal className="display display-lg mt-5 text-center">Seven disciplines, one studio.</SplitReveal>
        <div className="mt-12 grid grid-cols-2 gap-3">
          {services.map((s, i) => (
            <ServiceCard key={s.slug} s={s} i={i} className={i % 2 === 1 ? "translate-y-10" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Process -- */

export { ProcessTimeline } from "./Process";

/* ---------------------------------------------------------------- Journal -- */

export function JournalTeaser() {
  return (
    <section className="bg-bone pb-28 pt-20 text-ink md:pb-40 md:pt-28">
      <div className="wrap">
        <div className="mb-12 flex items-end justify-between gap-6">
          <SplitReveal className="display display-lg">Journal</SplitReveal>
          <TLink href="/journal" className="btn btn-ghost shrink-0">
            All articles
          </TLink>
        </div>
        <RevealGroup className="grid gap-10 md:grid-cols-3 md:gap-6">
          {posts.map((p, i) => (
            <TLink key={p.slug} href={`/journal/${p.slug}`} data-reveal data-delay={i * 0.1} data-cursor="Read" className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-ink/10">
                <Photo
                  id={p.image}
                  alt={p.title}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
              </div>
              <p className="mt-5 text-[12.5px] uppercase tracking-[0.12em] text-ink/50">
                {p.category} · {p.read}
              </p>
              <h3 className="display mt-2 text-[24px] leading-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] text-ink/60">{p.excerpt}</p>
            </TLink>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
