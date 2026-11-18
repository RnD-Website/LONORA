"use client";

import { useRef } from "react";
import { process, projects } from "@/lib/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Photo } from "../Photo";

/* ------------------------------------------------------------- Line art -- */

/** Hand-drawn style architectural sketches; every path draws itself in. */
function SketchStair({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 300" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" data-loop-draw>
        <path d="M20 290 L20 40 L70 10" />
        <path d="M20 290 L120 230 L120 60 L70 10" />
        <path d="M120 230 L200 280" />
        <path d="M120 60 L175 30 L175 250" />
        <path d="M40 250 L60 238 L60 226 L80 214 L80 202 L100 190 L100 178" />
        <path d="M40 250 L40 262 M60 238 L60 250 M80 214 L80 226" />
        <path d="M86 120 L104 110 L104 160 L86 170 Z" />
        <path d="M150 70 L150 210" />
        <path d="M135 95 L160 80 M135 120 L160 105" strokeDasharray="3 4" />
      </g>
    </svg>
  );
}

function SketchPlan({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 200" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" data-loop-draw>
        <path d="M60 20 L120 20 L120 70 L200 70 L200 120 L150 120 L150 170 L90 170 L90 120 L20 120 L20 70 L60 70 Z" />
        <path d="M60 20 L60 70 M120 70 L120 120 M90 120 L150 120" />
        <path d="M30 150 L240 60" />
        <path d="M70 40 L110 40 M130 85 L190 85" strokeDasharray="3 4" />
        <path d="M100 95 A12 12 0 0 1 112 107" />
      </g>
    </svg>
  );
}

/** Axonometric room drawing for the first panel. */
function SketchAxo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" data-loop-draw>
        <path d="M40 110 L150 50 L270 110 L160 175 Z" />
        <path d="M40 110 L40 80 L150 20 L150 50" strokeWidth="2.2" />
        <path d="M150 20 L270 80 L270 110" strokeWidth="2.2" />
        <path d="M95 80 L205 142" />
        <path d="M150 50 L150 118 M150 118 L205 142 M150 118 L95 148" />
        <path d="M60 112 L90 96 L110 107 L80 123 Z" />
        <path d="M175 70 L200 84 L200 92 L175 78 Z" />
        <path d="M215 120 L240 106 L255 114 L230 128 Z" />
        <path d="M120 140 A10 6 0 1 0 140 140 A10 6 0 1 0 120 140" />
        <path d="M60 95 L60 70 M75 87 L75 62 M240 95 L240 70 M255 103 L255 78" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------- Panels -- */

const MOSAIC = [
  { id: () => projects[0].images[1], col: 2, row: 1 },
  { id: () => projects[6].images[2], col: 4, row: 1 },
  { id: () => projects[2].images[3], col: 1, row: 2 },
  { id: () => projects[4].images[1], col: 3, row: 2 },
  { id: () => projects[9].images[2], col: 5, row: 2 },
];

function PanelVisual({ i }: { i: number }) {
  if (i === 0) return <SketchAxo className="max-h-full w-[80%] text-ink" />;
  if (i === 1)
    return (
      <div className="grid w-[86%] grid-cols-5 grid-rows-2 gap-0">
        {MOSAIC.map((m, k) => (
          <div key={k} data-mosaic className="aspect-[3/4] will-change-transform" style={{ gridColumn: m.col, gridRow: m.row }}>
            <div data-tile className="h-full w-full overflow-hidden">
              <Photo id={m.id()} alt="" sizes="8vw" />
            </div>
          </div>
        ))}
      </div>
    );
  const id = i === 2 ? projects[6].images[5] : projects[8].images[0];
  return (
    <div data-tile className="aspect-[4/5] h-full max-h-[30svh] overflow-hidden max-md:h-auto max-md:max-h-none max-md:w-[62%]">
      <Photo id={id} alt={i === 2 ? "Detailing materials and light" : "A finished LONORA interior"} sizes="20vw" />
    </div>
  );
}

function Panel({ i, mobile = false }: { i: number; mobile?: boolean }) {
  const p = process[i];
  const light = i % 2 === 0;
  return (
    <article
      data-panel
      className={`relative flex shrink-0 flex-col justify-between ${
        mobile ? "min-h-[520px] rounded-[10px] p-6" : "h-[72svh] w-[34vw] p-[2.2vw]"
      } ${light ? "bg-bone text-ink" : "bg-[#4a2421] text-bone ring-1 ring-inset ring-white/10"}`}
    >
      <header className="flex items-start gap-3">
        <span className={`mt-2 text-[10.5px] tracking-[0.12em] ${light ? "text-ink/50" : "text-white/50"}`}>[ {p.index} ]</span>
        <h3 className="display text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none">{p.title}</h3>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <PanelVisual i={i} />
      </div>
      <footer>
        <span className={`text-[11px] uppercase tracking-[0.14em] text-terracotta`}>{p.duration}</span>
        <p className={`mt-2 max-w-[340px] text-[14px] leading-relaxed ${light ? "text-ink/65" : "text-white/65"}`}>{p.text}</p>
      </footer>
    </article>
  );
}

/* ---------------------------------------------------------------- Section -- */

export function ProcessTimeline({ tone = "dark" }: { tone?: "dark" | "light" }) {
  void tone;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Line art draws itself whenever it enters.
      section.current?.querySelectorAll<SVGPathElement>("[data-draw] path, path[data-draw]").forEach((path) => {
        const len = path.getTotalLength();
        path.style.strokeDasharray = path.getAttribute("stroke-dasharray") ? path.style.strokeDasharray : `${len}`;
        if (!path.getAttribute("stroke-dasharray")) {
          gsap.fromTo(
            path,
            { strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 2.4,
              ease: "power2.inOut",
              scrollTrigger: { trigger: path.closest("svg"), start: "top 85%", once: true },
            },
          );
        }
      });

      if (prefersReducedMotion()) return;

      // Ambient, never-ending motion so the panels feel alive while you read.
      // 1. The axonometric room draws itself, holds, erases, and starts again.
      section.current?.querySelectorAll<SVGGElement>("[data-loop-draw]").forEach((g) => {
        const paths = Array.from(g.querySelectorAll<SVGPathElement>("path"));
        const solid = paths.filter((p) => !p.getAttribute("stroke-dasharray"));
        solid.forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        loop
          .to(solid, { strokeDashoffset: 0, duration: 2.8, stagger: 0.18, ease: "power2.inOut" })
          .to(solid, { strokeDashoffset: (_i, el) => -(el as SVGPathElement).getTotalLength(), duration: 2.2, stagger: 0.12, ease: "power2.inOut" }, "+=2.4");
        gsap.to(g.closest("svg"), { y: -10, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      // 2. Mosaic tiles slowly travel around the checkerboard, each image breathing.
      const cells = MOSAIC.map((m) => [m.col, m.row]);
      section.current?.querySelectorAll<HTMLElement>("[data-mosaic]").forEach((tile) => {
        // Index within its own grid (the mosaic renders once for desktop, once for mobile).
        const k = Array.prototype.indexOf.call(tile.parentElement?.children ?? [], tile);
        const steps = cells.length;
        const tl = gsap.timeline({ repeat: -1 });
        for (let s = 1; s <= steps; s++) {
          const [c0, r0] = cells[k];
          const [c1, r1] = cells[(k + s) % steps];
          tl.to(tile, { xPercent: (c1 - c0) * 100, yPercent: (r1 - r0) * 100, duration: 1.6, ease: "power3.inOut" }, `+=${s === 1 ? 2 : 2.2}`);
        }
        const img = tile.querySelector("img");
        if (img) gsap.fromTo(img, { scale: 1.02 }, { scale: 1.14, duration: 6 + k, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = track.current!;
        const vw = () => window.innerWidth;
        // Panels rise in small from the lower right, grow to full size, then glide left.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.2}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(
          el,
          { x: () => vw() * 0.78, y: () => window.innerHeight * 0.55, scale: 0.28 },
          { x: () => vw() * 0.3, y: 0, scale: 1, ease: "power2.inOut", duration: 1 },
        )
          .to(intro.current, { opacity: 0.25, filter: "blur(4px)", duration: 0.6, ease: "none" }, 0.35)
          .fromTo("[data-tile]", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", stagger: 0.06, duration: 0.5 }, 0.6)
          .to(el, { x: () => -(el.scrollWidth - vw() + vw() * 0.04), ease: "none", duration: 1.6 }, 1.05);
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      className="relative overflow-hidden bg-[#311414] text-bone"
    >
      {/* Desktop: pinned stage */}
      <div className="relative hidden h-[100svh] md:block">
        <div ref={intro} className="absolute inset-0">
          <SketchStair className="absolute left-[4vw] top-[30%] w-[11vw] text-white/80" />
          <SketchPlan className="absolute right-[4vw] top-[22%] w-[14vw] text-white/80" />
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">[ How we work ]</p>
            <h2 className="display mt-6 text-[clamp(2rem,3.6vw,3.8rem)] leading-[1.02]">
              Listen closely.
              <br />
              Design precisely.
              <br />
              Deliver completely.
            </h2>
          </div>
        </div>
        <div ref={track} className="absolute bottom-0 left-0 flex origin-bottom-left will-change-transform">
          {process.map((_, i) => (
            <Panel key={i} i={i} />
          ))}
        </div>
      </div>

      {/* Mobile: intro + stacked panels */}
      <div className="py-24 wrap md:hidden">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">[ How we work ]</p>
          <h2 className="display mt-5 text-[2.1rem] leading-[1.05]">
            Listen closely.
            <br />
            Design precisely.
            <br />
            Deliver completely.
          </h2>
        </div>
        <div className="mt-12 space-y-4">
          {process.map((_, i) => (
            <Panel key={i} i={i} mobile />
          ))}
        </div>
      </div>
    </section>
  );
}
