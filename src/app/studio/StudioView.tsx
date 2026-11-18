"use client";

import { useRef } from "react";
import { projects, team } from "@/lib/content";
import { RevealGroup, SplitReveal } from "@/components/Reveal";
import { TLink } from "@/components/Transition";
import { Photo } from "@/components/Photo";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const PRINCIPLES = [
  {
    t: "Architecture first",
    d: "We start with the bones: proportion, circulation, light and sightlines. Decoration comes last, and less of it is needed.",
  },
  {
    t: "Light as material",
    d: "We study the sun hour by hour and design surfaces to receive it. The best rooms change through the day.",
  },
  {
    t: "Honest materials",
    d: "Stone, timber, lime, linen and metal that age well. Fewer of them, used generously.",
  },
  {
    t: "Seen before built",
    d: "Real-time 3D lets clients walk through their space early, so decisions are confident and surprises disappear.",
  },
];

// A long strip of studio and project imagery that drifts sideways as you scroll.
// Entries are photo ids/paths, or a { video } clip of the studio at work.
type StripItem = string | { video: string; poster: string; label: string };
const STRIP: StripItem[] = [
  { video: "/video/lonora-team.mp4", poster: "/video/lonora-team-poster.jpg", label: "The LONORA team reviewing floor plans together" },
  projects[2].images[1],
  projects[5].images[2],
  "/images/about-model-review.jpg",
  projects[7].images[1],
  { video: "/video/about-architect.mp4", poster: "/video/about-architect-poster.jpg", label: "An architect drawing at the studio" },
  projects[6].images[3],
  projects[9].images[1],
  "/images/about-architect-drawing.jpg",
  projects[8].images[2],
];

// Staggered placement on a 6-column grid (desktop), echoing a contact sheet:
// row 1 → columns 1, 2, 4, 6 · row 2 → 1, 3, 5 · row 3 → 2, 4.
const TEAM_COLS = [
  "md:col-start-1",
  "md:col-start-2",
  "md:col-start-4",
  "md:col-start-6",
  "md:col-start-1",
  "md:col-start-3",
  "md:col-start-5",
  "md:col-start-2",
  "md:col-start-4",
];

/** Faint vertical guides, like a drawing grid behind the page. */
function GridLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 wrap">
      <div className="grid h-full grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`h-full border-l border-white/[0.05] ${i === 5 ? "border-r" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default function StudioView() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Endless auto-slide: the strip holds two copies, so moving it by half loops seamlessly.
      gsap.to("[data-strip]", { xPercent: -50, duration: 60, ease: "none", repeat: -1 });
      gsap.utils.toArray<HTMLElement>("[data-member]").forEach((el, i) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out",
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative bg-[#311414] text-bone">
      <GridLines />

      {/* Statement */}
      <section className="relative pb-20 pt-40 md:pb-28 md:pt-52">
        <div className="wrap">
          <p className="eyebrow mb-8 text-white/50">About us</p>
          <SplitReveal as="h1" immediate delay={0.2} className="display display-lg max-w-[22ch]">
            Because the rooms you live in should feel like they were always meant to be.
          </SplitReveal>
          <RevealGroup className="mt-12 grid max-w-[920px] gap-6 text-[16px] leading-relaxed text-white/70 md:grid-cols-2 md:gap-10">
            <p data-reveal>
              Too many interiors are decorated rather than designed: styled on the surface, unresolved underneath. Not for lack
              of taste, but for lack of architecture.
            </p>
            <p data-reveal data-delay={0.1}>
              LONORA was founded to close that gap: an interior architecture studio that plans space with the rigour of a
              building, then finishes it with light, proportion and a few honest materials.
            </p>
          </RevealGroup>
        </div>
      </section>

      {/* Image strip */}
      <section data-strip-wrap className="relative overflow-hidden pb-28 md:pb-40">
        <div data-strip className="flex w-max gap-3 pr-3 md:gap-4 md:pr-4">
          {[...STRIP, ...STRIP].map((item, i) => (
            <div key={i} aria-hidden={i >= STRIP.length || undefined} className="relative aspect-[21/20] w-[56vw] shrink-0 overflow-hidden rounded-[18px] sm:w-[32vw] md:w-[20vw]">
              {typeof item === "string" ? (
                <Photo id={item} alt="" sizes="(min-width: 768px) 20vw, 56vw" />
              ) : (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={item.video}
                  poster={item.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={item.label}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* People */}
      <section className="relative pb-28 md:pb-40">
        <div className="wrap">
          <div className="grid md:grid-cols-6">
            <div className="md:col-span-3 md:col-start-4">
              <SplitReveal className="display display-md">The people behind the work.</SplitReveal>
              <RevealGroup className="mt-8 space-y-5 text-[15.5px] leading-relaxed text-white/65">
                <p data-reveal>
                  LONORA is a team of interior architects, designers and visualisers who believe that how a room is planned
                  matters as much as how it looks.
                </p>
                <p data-reveal data-delay={0.1}>
                  We bring together space planning, joinery, lighting, sourcing and real-time 3D, unified by a shared
                  commitment to calm, lasting interiors.
                </p>
              </RevealGroup>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-28 md:grid-cols-6 md:gap-x-6 md:gap-y-14">
            {team.map((m, i) => (
              <figure key={i} data-member className={`${TEAM_COLS[i % TEAM_COLS.length]} md:col-span-1`}>
                <div className="aspect-[5/6] overflow-hidden rounded-[14px] bg-white/5">
                  {/* One shared warm grade so stock portraits read as a single studio shoot. */}
                  <Photo
                    id={m.photo}
                    alt={`${m.role} at LONORA`}
                    sizes="(min-width: 768px) 16vw, 45vw"
                    className="[filter:grayscale(.4)_sepia(.25)_contrast(1.04)_brightness(.94)]"
                  />
                </div>
                <figcaption className="mt-3">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em]">{m.name}</p>
                  <p className="mt-1 text-[10.5px] uppercase leading-snug tracking-[0.1em] text-white/40">{m.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative pb-28 md:pb-40">
        <div className="wrap">
          <SplitReveal className="display display-lg">What we hold to.</SplitReveal>
          <RevealGroup className="mt-14 border-t border-white/12">
            {PRINCIPLES.map((p, i) => (
              <div key={p.t} data-reveal data-delay={i * 0.06} className="grid gap-3 border-b border-white/12 py-8 md:grid-cols-6 md:gap-6">
                <span className="text-[12px] tracking-[0.14em] text-white/40">0{i + 1}</span>
                <p className="display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-tight md:col-span-2">{p.t}</p>
                <p className="max-w-[460px] text-[15px] leading-relaxed text-white/65 md:col-span-3 md:col-start-4">{p.d}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Invitation card */}
      <section className="relative pb-28 md:pb-40">
        <div className="wrap">
          <div className="mx-auto grid max-w-[1100px] overflow-hidden rounded-[22px] md:min-h-[480px] md:grid-cols-2">
            <div className="flex flex-col justify-between gap-10 bg-bone p-8 text-ink md:p-14">
              <div>
                <h2 className="display text-[clamp(2rem,3.2vw,3rem)] leading-[1.02]">Ready to compose your space?</h2>
                <p className="mt-6 max-w-[380px] text-[15px] leading-relaxed text-ink/65">
                  Tell us about your home or project. We reply within two working days with next steps and a time to meet.
                </p>
              </div>
              <TLink href="/contact" className="btn btn-ghost-ink self-start">
                Start a project
              </TLink>
            </div>
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src="/video/lonora-living.mp4"
                poster="/video/lonora-living-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="A LONORA living room with timber slat wall and warm light"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
