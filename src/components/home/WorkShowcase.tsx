"use client";

import { useRef } from "react";
import { projects } from "@/lib/content";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { TLink } from "../Transition";
import { Photo } from "../Photo";

// The four projects featured on the homepage.
const FEATURED = ["maison-sable", "villa-olive", "ember-lounge", "casa-lume"]
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter((p): p is (typeof projects)[number] => Boolean(p));

/**
 * Selected work as a pinned, sideways journey: an opening title panel, then one
 * full-screen scene per project (a backdrop photo with a card gliding in), and
 * a closing call to explore every project.
 */
export function WorkShowcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const move = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Inside each scene: the backdrop drifts slower than the track, the
        // vertical blinds open to reveal it, and the card slides in.
        gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((scene) => {
          const st = { containerAnimation: move, trigger: scene, scrub: true } as const;
          gsap.fromTo(scene.querySelector("[data-bg]"), { xPercent: -12 }, { xPercent: 12, ease: "none", scrollTrigger: { ...st, start: "left right", end: "right left" } });
          gsap.fromTo(
            scene.querySelectorAll("[data-blind]"),
            { scaleX: 1 },
            { scaleX: 0, ease: "power2.inOut", stagger: 0.06, scrollTrigger: { ...st, start: "left 95%", end: "left 35%" } },
          );
          gsap.fromTo(
            scene.querySelector("[data-card]"),
            { xPercent: 45, opacity: 0.4 },
            { xPercent: 0, opacity: 1, ease: "power3.out", scrollTrigger: { ...st, start: "left 80%", end: "left 10%" } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative overflow-hidden bg-[#311414] text-bone">
      <div ref={track} className="flex flex-col md:h-[100svh] md:w-max md:flex-row">
        {/* Opening panel */}
        <div className="relative flex min-h-[80svh] w-full shrink-0 items-center overflow-hidden md:h-full md:w-[100vw]">
          <div className="absolute inset-0">
            <Photo id={projects[8].images[0]} alt="" sizes="100vw" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(49,20,20,0.82)_0%,rgba(49,20,20,0.45)_55%,rgba(49,20,20,0.2)_100%)]" />
          <div className="relative wrap grid w-full gap-8 md:grid-cols-12 md:items-end">
            <h2 className="display text-[clamp(3rem,9vw,9rem)] leading-[0.9] md:col-span-7">Selected work</h2>
            <div className="md:col-span-4 md:col-start-9 md:pb-4">
              <p className="eyebrow mb-4 text-white/60">[ {String(FEATURED.length).padStart(2, "0")} projects ]</p>
              <p className="max-w-[340px] text-[15.5px] leading-relaxed text-white/80">
                Homes, hospitality and workplaces across the Gulf and Europe. Each one planned like architecture and finished by
                hand. Scroll to walk through a few.
              </p>
            </div>
          </div>
        </div>

        {/* One scene per project */}
        {FEATURED.map((p, i) => (
          <div key={p.slug} data-scene className="relative flex min-h-[100svh] w-full shrink-0 items-center overflow-hidden md:h-full md:w-[100vw]">
            <div data-bg className="absolute inset-[-4%_-14%] will-change-transform">
              <Photo id={p.images[1] ?? p.images[0]} alt="" sizes="100vw" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[#311414]/35" />
            {/* Vertical blinds that open as the scene arrives (desktop) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:flex">
              {Array.from({ length: 6 }).map((_, k) => (
                <span key={k} data-blind className="h-full flex-1 origin-left bg-[#311414]" />
              ))}
            </div>

            <div className="relative wrap flex w-full justify-center md:justify-end">
              <TLink
                href={`/projects/${p.slug}`}
                data-card
                data-cursor="View"
                className="group block w-full max-w-[520px] overflow-hidden rounded-[22px] bg-bone text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] md:mr-[4vw] md:w-[38vw]"
              >
                <div className="px-7 pt-7 text-center md:px-9 md:pt-9">
                  <p className="text-[11.5px] uppercase tracking-[0.16em] text-ink/45">
                    {String(i + 1).padStart(2, "0")} · {p.category}
                  </p>
                  <h3 className="display mt-3 text-[clamp(1.9rem,3vw,3rem)] leading-none">{p.title}</h3>
                  <p className="mx-auto mt-4 max-w-[380px] text-[14.5px] leading-relaxed text-ink/60">{p.tagline}.</p>
                </div>
                <div className="relative mx-5 mt-6 aspect-[16/10] overflow-hidden rounded-[16px] md:mx-6">
                  <Photo
                    id={p.images[0]}
                    alt={`${p.title}, ${p.type.toLowerCase()} in ${p.location}`}
                    sizes="(min-width: 768px) 38vw, 90vw"
                    className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-7 py-6 md:px-9">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ink/50 md:text-[12px]">
                    [ {p.location} · {p.area} ]
                  </span>
                  <span className="btn btn-ghost-ink h-10 shrink-0 whitespace-nowrap text-[13px]">View project</span>
                </div>
              </TLink>
            </div>
          </div>
        ))}

        {/* Closing call to action */}
        <div className="relative flex min-h-[70svh] w-full shrink-0 items-center justify-center md:h-full md:w-[70vw]">
          <div className="wrap text-center">
            <p className="eyebrow mb-6 text-white/55">[ The full portfolio ]</p>
            <h3 className="display mx-auto max-w-[14ch] text-[clamp(2.4rem,5vw,5rem)] leading-[0.95]">
              {projects.length} projects, one way of working
            </h3>
            <TLink href="/projects" className="btn btn-solid mt-10">
              Explore all projects
            </TLink>
          </div>
        </div>
      </div>
    </section>
  );
}
