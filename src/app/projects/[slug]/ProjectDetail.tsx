"use client";

import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/lib/content";
import RoomView from "@/components/three/RoomView";
import { RevealGroup, SplitReveal } from "@/components/Reveal";
import { TLink } from "@/components/Transition";
import FloorPlan from "@/components/FloorPlan";
import { Photo, RevealPhoto } from "@/components/Photo";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const SHOT_NAMES = ["Arrival", "Detail", "Reverse"];

/* ---------------------------------------------------------------- Hero -- */

function Hero({ p, index }: { p: Project; index: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-hero-img]", { scale: 1.25 }, { scale: 1.06, duration: 2.4, ease: "expo.out" });
      gsap.to("[data-hero-img]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.from("[data-hero-fact]", { y: 30, opacity: 0, stagger: 0.08, duration: 1.4, delay: 0.6 });
    },
    { scope: root },
  );

  const facts = [
    ["Area", p.area],
    ["Type", p.type],
    ["Location", p.location],
    ["Status", `${p.status} · ${p.year}`],
  ];

  return (
    <section ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden text-bone">
      <div data-hero-img className="absolute inset-0 will-change-transform">
        <Photo id={p.images[0]} alt={`${p.title}, ${p.type.toLowerCase()} in ${p.location}`} priority />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.5)_0%,rgba(12,9,7,0.15)_30%,rgba(12,9,7,0.35)_60%,rgba(12,9,7,0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(12,9,7,0.55)_0%,rgba(12,9,7,0)_60%)]" />

      <div className="relative z-[2] grid h-full grid-rows-[1fr_auto] wrap">
        <div className="grid content-center gap-6 pt-20 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-cream [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]">
              {String(index + 1).padStart(2, "0")} · {p.category}
            </p>
            <SplitReveal as="h1" immediate delay={0.35} className="display display-xl">
              {p.title}
            </SplitReveal>
          </div>
          <p className="max-w-[360px] text-[17px] leading-snug text-white/85 md:col-span-4 md:col-start-9 md:pb-3">
            {p.tagline}.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/20 py-6 md:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} data-hero-fact>
              <dt className="text-[11.5px] uppercase tracking-[0.14em] text-white/55">{k}</dt>
              <dd className="mt-1 text-[15px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Sticky fact card -- */

function FactTicker({ p }: { p: Project }) {
  const items = [
    ...p.facts.map((f) => ({ label: f.label, value: f.value })),
    ...p.materials.slice(0, 3).map((m) => ({ label: "Material", value: m.name })),
  ];
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const value = useRef<HTMLDivElement>(null);

  // Appear after the hero, hide again before the footer.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const end = document.documentElement.scrollHeight - window.innerHeight * 1.9;
      setShown(y > window.innerHeight * 0.85 && y < end);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % items.length), 3200);
    return () => window.clearInterval(id);
  }, [items.length, open]);

  useEffect(() => {
    if (value.current) gsap.fromTo(value.current, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 });
  }, [i]);

  return (
    <div
      className={`fixed bottom-5 left-[var(--gutter)] z-40 hidden transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] md:block ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <div className="glass-light w-[260px] rounded-2xl p-4 text-ink shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 overflow-hidden">
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink/50">{items[i].label}</p>
            <div ref={value} className="display mt-1 truncate text-[20px]">
              {items[i].value}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide project figures" : "Show all project figures"}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[15px] transition-transform duration-500 ${open ? "rotate-45" : ""}`}
          >
            +
          </button>
        </div>
        {open && (
          <ul className="mt-3 space-y-1.5 border-t border-ink/10 pt-3 text-[13px]">
            {items.map((it, k) => (
              <li key={k} className="flex justify-between gap-3">
                <span className="text-ink/50">{it.label}</span>
                <span className="text-right">{it.value}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-1">
          {items.map((_, k) => (
            <span key={k} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${k === i ? "bg-ink" : "bg-ink/15"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Sections -- */

/** Counts the leading number of a figure up from zero when it scrolls into view. */
function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const m = value.match(/^([\d.,]+)(.*)$/);
  useGSAP(
    () => {
      if (!m || !ref.current || prefersReducedMotion()) return;
      const target = parseFloat(m[1].replace(/,/g, ""));
      const decimals = (m[1].split(".")[1] ?? "").length;
      const grouped = m[1].includes(",");
      const obj = { n: 0 };
      const render = () => {
        const n = decimals ? obj.n.toFixed(decimals) : Math.round(obj.n).toString();
        ref.current!.textContent = (grouped ? Number(n).toLocaleString("en-US") : n) + m[2];
      };
      render();
      gsap.to(obj, {
        n: target,
        duration: 2,
        ease: "power3.out",
        onUpdate: render,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [value] },
  );
  return (
    <p ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </p>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="wrap grid gap-8 py-24 md:grid-cols-12 md:py-36">
      <SplitReveal className="display display-md md:col-span-5">{title}</SplitReveal>
      <RevealGroup className="md:col-span-6 md:col-start-7">
        <p data-reveal className="text-[18px] leading-[1.6] text-ink/75 md:text-[20px]">
          <span className="mr-16 inline-block" aria-hidden />
          {text}
        </p>
      </RevealGroup>
    </section>
  );
}

function Pair({ a, b, alt }: { a: string; b: string; alt: string }) {
  return (
    <div className="wrap grid gap-4 md:grid-cols-2 md:gap-6">
      <RevealPhoto id={a} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[4/5]" />
      <RevealPhoto id={b} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[4/5]" />
    </div>
  );
}

/* --------------------------------------------------------------- Page -- */

export default function ProjectDetail({ project, index }: { project: Project; next?: Project; index: number }) {
  const [shot, setShot] = useState(0);
  const p = project;
  const img = p.images;
  const alt = `${p.title} interior`;
  const similar = [
    ...projects.filter((x) => x.slug !== p.slug && x.category === p.category),
    ...projects.filter((x) => x.slug !== p.slug && x.category !== p.category),
  ].slice(0, 3);

  const info: [string, string | string[]][] = [
    ["Location", p.location],
    ["Client", p.client],
    ["Team", p.team],
    ["Scope", p.scope],
    ["Area", p.area],
    ["Year", p.year],
  ];

  return (
    <article className="bg-bone text-ink">
      <Hero p={p} index={index} />
      <FactTicker p={p} />

      {/* Intro + project information */}
      <section className="wrap grid gap-14 pb-10 pt-24 md:grid-cols-12 md:pt-32">
        <div className="md:col-span-5">
          <SplitReveal as="p" className="display display-md leading-[1.08]">
            {p.summary}
          </SplitReveal>
          <RevealGroup>
            <p data-reveal className="mt-8 text-[16px] leading-relaxed text-ink/65">
              {p.concept[0]}
            </p>
          </RevealGroup>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <h2 className="inline-block rounded-full border border-ink/20 px-3 py-1 text-[12px] uppercase tracking-[0.12em]">
            Project information
          </h2>
          <RevealGroup>
            <dl className="mt-8">
              {info.map(([k, v]) => (
                <div key={k} data-reveal className="grid grid-cols-1 gap-2 border-t border-ink/12 py-5 sm:grid-cols-[160px_1fr]">
                  <dt className="text-[11.5px] uppercase tracking-[0.14em] text-ink/45">{k}</dt>
                  <dd className="text-[15.5px] leading-relaxed">
                    {Array.isArray(v) ? (
                      <ul>
                        {v.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </RevealGroup>
        </div>
      </section>

      {/* Image + story rhythm */}
      <div className="wrap py-6">
        <RevealPhoto id={img[1]} alt={alt} aspect="aspect-[4/3] md:aspect-[16/9]" />
      </div>
      <TextBlock {...p.story[0]} />
      <div className="wrap pb-6">
        <RevealPhoto id={img[2]} alt={alt} aspect="aspect-[4/3] md:aspect-[16/9]" />
      </div>
      {img[3] && img[4] && <Pair a={img[3]} b={img[4]} alt={alt} />}
      <TextBlock {...p.story[1]} />
      {img[5] && (
        <div className="wrap pb-6">
          <RevealPhoto id={img[5]} alt={alt} aspect="aspect-[4/3] md:aspect-[16/9]" />
        </div>
      )}

      {/* Photo + live 3D side by side */}
      <section className="wrap grid gap-4 md:grid-cols-2 md:gap-6">
        {img[6] ? (
          <RevealPhoto id={img[6]} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[4/5]" />
        ) : (
          <RevealPhoto id={img[0]} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" aspect="aspect-[4/5]" />
        )}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-espresso text-bone">
          <RoomView preset={p.room} shot={shot} mode="look" fov={46} standalone />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-5">
            <span className="glass rounded-full px-3 py-1 text-[11.5px] uppercase tracking-[0.12em]">Live 3D model</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-wrap items-center justify-between gap-3 p-5">
            <span className="font-[family-name:var(--font-hand)] text-[22px] text-white/85">move to look around</span>
            <div className="glass flex gap-1 rounded-full p-1" role="tablist" aria-label="Camera views">
              {SHOT_NAMES.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={shot === i}
                  onClick={() => setShot(i)}
                  className={`rounded-full px-3 py-1.5 text-[12.5px] transition-colors duration-500 ${shot === i ? "bg-bone text-ink" : "text-white/75 hover:text-white"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="wrap grid gap-10 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-4">
          <SplitReveal className="display display-md">In numbers</SplitReveal>
          <p className="mt-5 max-w-[340px] text-[15.5px] text-ink/60">{p.concept[1] ?? p.summary}</p>
        </div>
        <RevealGroup className="grid gap-6 sm:grid-cols-3 md:col-span-7 md:col-start-6">
          {p.facts.map((f, i) => (
            <div key={f.label} data-reveal data-delay={i * 0.08} className="border-t border-ink/15 pt-5">
              <CountUp value={f.value} className="display text-[44px] leading-none md:text-[56px]" />
              <p className="mt-3 text-[13.5px] text-ink/55">{f.label}</p>
            </div>
          ))}
        </RevealGroup>
      </section>

      {/* Materials + plan */}
      <section className="bg-[linear-gradient(180deg,var(--color-bone)_0%,var(--color-cream)_22%,var(--color-cream)_78%,var(--color-bone)_100%)] py-24 md:py-32">
        <div className="wrap grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="inline-block rounded-full border border-ink/20 px-3 py-1 text-[12px] uppercase tracking-[0.12em]">
              Material palette
            </h2>
            <RevealGroup className="mt-8 space-y-3">
              {p.materials.map((m, i) => (
                <div key={m.name} data-reveal data-delay={i * 0.06} className="flex items-center gap-4 border-b border-ink/10 pb-3">
                  <span className="h-11 w-11 shrink-0 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.18)]" style={{ background: m.color }} />
                  <span className="text-[16px]">{m.name}</span>
                </div>
              ))}
            </RevealGroup>
          </div>
          <div className="md:col-span-7">
            <h2 className="inline-block rounded-full border border-ink/20 px-3 py-1 text-[12px] uppercase tracking-[0.12em]">Layout</h2>
            <div className="mt-8">
              <FloorPlan rooms={p.plan} accent={p.room.accent} />
            </div>
          </div>
        </div>
      </section>

      {/* Similar projects */}
      <section className="wrap py-24 md:py-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <SplitReveal className="display display-md">Similar projects</SplitReveal>
          <TLink href="/projects" className="btn btn-dark h-10 shrink-0 text-[13.5px]">
            Discover all
          </TLink>
        </div>
        <RevealGroup className="grid gap-10 md:grid-cols-3 md:gap-6">
          {similar.map((s, i) => (
            <TLink key={s.slug} href={`/projects/${s.slug}`} data-reveal data-delay={i * 0.08} data-cursor="View" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-ink/10">
                <Photo
                  id={s.images[0]}
                  alt={`${s.title} interior`}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="display text-[22px]">{s.title}</h3>
                  <p className="mt-1 text-[13.5px] text-ink/55">
                    {s.type} · {s.location}
                  </p>
                </div>
                <span className="mt-1 text-[13px] text-ink/55">{s.area}</span>
              </div>
            </TLink>
          ))}
        </RevealGroup>
      </section>

    </article>
  );
}
