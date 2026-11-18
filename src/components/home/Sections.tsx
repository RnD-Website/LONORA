"use client";

import { useEffect, useRef } from "react";
import { posts, projects, services } from "@/lib/content";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RevealGroup, SplitReveal } from "../Reveal";
import { TLink } from "../Transition";
import { Photo } from "../Photo";

/* ---------------------------------------------------------------- Manifesto -- */

const PILLARS = [
  { t: "Light first", d: "Every plan begins with a study of where the sun falls, hour by hour.", img: () => projects[0].images[2] },
  { t: "Fewer, finer materials", d: "Three or four materials, used generously, for calm and lasting rooms.", img: () => projects[6].images[5] },
  { t: "Seen before built", d: "Real-time 3D lets you walk your space before a wall is moved.", img: () => projects[1].images[0] },
];

/** Small rounded photo set inline with the statement, like a word. */
function Chip({ id }: { id: string }) {
  return (
    <span
      data-chip
      aria-hidden
      className="relative mx-[0.12em] inline-block h-[0.78em] w-[1.7em] -translate-y-[0.06em] overflow-hidden rounded-full align-middle"
    >
      <Photo id={id} alt="" sizes="160px" />
    </span>
  );
}

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
      gsap.fromTo(
        "[data-chip]",
        { scale: 0.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: 0.15,
          ease: "back.out(1.6)",
          duration: 0.9,
          scrollTrigger: { trigger: "[data-words]", start: "top 75%", once: true },
        },
      );
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-cream py-28 text-ink md:py-40">
      <div className="wrap">

        <p data-words className="display mx-auto max-w-[22ch] text-center text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.04]">
          Interiors <Chip id={projects[2].images[0]} /> designed like architecture. Calm, considered{" "}
          <Chip id={projects[8].images[0]} /> and built to last <Chip id={projects[4].images[1]} />
        </p>

        <RevealGroup className="mt-20 grid gap-14 md:mt-28 md:grid-cols-3 md:gap-8">
          {PILLARS.map((p, i) => (
            <article key={p.t} data-reveal data-delay={i * 0.1} className={`group text-center ${i === 1 ? "md:mt-20" : ""}`}>
              {/* Arched frame: a doorway motif */}
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-b-[18px] rounded-t-full bg-ink/10">
                <Photo
                  id={p.img()}
                  alt={p.t}
                  sizes="(min-width: 768px) 340px, 90vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
              </div>
              <h3 className="display mt-7 text-[clamp(1.5rem,2.2vw,2.1rem)] leading-tight">{p.t}</h3>
              <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-ink/60">{p.d}</p>
            </article>
          ))}
        </RevealGroup>
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
          <span className="mt-3 rounded-full bg-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur">
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
          <TLink href="/services" className="btn btn-ghost pointer-events-auto mt-9">
            Explore all
          </TLink>
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
        <div className="mt-20 text-center">
          <TLink href="/services" className="btn btn-ghost-ink">
            Explore all
          </TLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Process -- */

export { ProcessTimeline } from "./Process";

/* ---------------------------------------------------------------- Journal -- */

// Staggered card heights for the journal strip (cards align on the baseline).
const JOURNAL_HEIGHTS = ["md:h-[58svh]", "md:h-[40svh]", "md:h-[50svh]", "md:h-[36svh]", "md:h-[46svh]"];

export function JournalTeaser() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const hovering = useRef(false);

  // Endless auto-scroll that eases to a near stop while a card is hovered.
  // The strip can also be dragged sideways with the mouse or a finger.
  useEffect(() => {
    const el = track.current;
    const area = el?.parentElement;
    if (!el || !area) return;
    const reduced = prefersReducedMotion();
    let x = 0;
    let speed = 1;
    let visible = true;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let fling = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);

    const wrap = () => {
      const loopAt = (el.querySelector<HTMLElement>("[data-loop-start]")?.offsetLeft ?? 0) - el.offsetLeft;
      if (loopAt <= 0) return;
      while (-x >= loopAt) x += loopAt;
      while (x > 0) x -= loopAt;
    };
    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      if (!dragging) {
        const target = reduced || hovering.current ? 0 : 1;
        speed += (target - speed) * 0.06;
        x -= speed * dt * 0.045;
        x += fling;
        fling *= 0.93;
        if (Math.abs(fling) < 0.05) fling = 0;
      }
      wrap();
      el.style.transform = `translate3d(${x}px,0,0)`;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      fling = 0;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      x += dx;
      fling = dx;
      if (moved > 6) area.classList.add("is-dragging");
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      area.classList.remove("is-dragging");
    };
    // A drag should not count as a click on the card underneath.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = 0;
    };
    const noNativeDrag = (e: DragEvent) => e.preventDefault();

    area.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    area.addEventListener("click", onClick, true);
    area.addEventListener("dragstart", noNativeDrag);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      area.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      area.removeEventListener("click", onClick, true);
      area.removeEventListener("dragstart", noNativeDrag);
    };
  }, []);

  return (
    <section ref={section} className="overflow-hidden bg-bone pb-28 pt-24 text-ink md:pb-40 md:pt-32">
      <div className="wrap">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-ink/50">[ Journal ]</p>
            <SplitReveal className="display display-lg">Notes from the studio</SplitReveal>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="max-w-[340px] text-[15px] leading-relaxed text-ink/60">
              Essays, methods and material notes, written by the people who draw the rooms.
            </p>
            <TLink href="/journal" className="btn btn-ghost-ink mt-6">
              All articles
            </TLink>
          </div>
        </div>
      </div>

      {/* Strip is clipped at the left margin and runs off the right edge of the screen */}
      <div className="mt-16 pl-[var(--gutter)] md:mt-20">
        <div className="cursor-grab select-none overflow-hidden [touch-action:pan-y] [&.is-dragging]:cursor-grabbing [&.is-dragging_a]:pointer-events-none">
        <div
          ref={track}
          className="flex w-max items-end gap-4 pr-4 will-change-transform md:gap-5 md:pr-5"
          onMouseLeave={() => (hovering.current = false)}
        >
          {[...posts, ...posts].map((p, k) => {
            const i = k % posts.length;
            return (
            <TLink
              key={`${p.slug}-${k}`}
              href={`/journal/${p.slug}`}
              data-cursor="Read"
              data-loop-start={k === posts.length ? "" : undefined}
              aria-hidden={k >= posts.length || undefined}
              tabIndex={k >= posts.length ? -1 : undefined}
              onMouseEnter={() => (hovering.current = true)}
              className="group block w-[78vw] shrink-0 sm:w-[46vw] md:w-[26vw]"
            >
              <div className={`relative h-[62vw] overflow-hidden rounded-[18px] bg-ink/10 sm:h-[38vw] ${JOURNAL_HEIGHTS[i % JOURNAL_HEIGHTS.length]}`}>
                <Photo
                  id={p.image}
                  alt={p.title}
                  sizes="(min-width: 768px) 26vw, 78vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
              </div>
              <h3 className="display mt-5 max-w-[16ch] text-[clamp(1.35rem,1.9vw,1.85rem)] leading-[1.05]">{p.title}</h3>
              <p className="mt-3 text-[12.5px] text-ink/50">
                {p.category} <span className="mx-1.5">·</span> {p.date}
              </p>
            </TLink>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
