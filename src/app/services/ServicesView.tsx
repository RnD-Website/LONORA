"use client";

import { useEffect, useRef, useState } from "react";
import { projects, services } from "@/lib/content";
import PageHero from "@/components/PageHero";
import { RevealGroup, SplitReveal } from "@/components/Reveal";
import { ProcessTimeline } from "@/components/home/Sections";
import Faq from "@/components/Faq";
import { TLink } from "@/components/Transition";
import { Photo } from "@/components/Photo";

// One photograph per discipline.
const IMAGE_FOR: Record<string, string> = {
  "interior-design": projects[0].images[0],
  "residential-interiors": projects[2].images[0],
  "commercial-interiors": projects[3].images[0],
  "space-planning": projects[5].images[0],
  "furniture-selection": projects[6].images[2],
  "3d-visualization": projects[1].images[0],
  renovation: projects[4].images[0],
};

export default function ServicesView() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);

  // The sticky photo follows whichever service is in the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="bg-espresso">
        <PageHero
          eyebrow="Services"
          title="From first sketch to final cushion"
          intro="Seven disciplines under one roof, so your project is designed, visualised, sourced and delivered by one team."
          image={projects[8].images[1]}
        />
      </div>

      {/* Intro */}
      <section className="bg-bone pt-24 text-ink md:pt-32">
        <div className="wrap grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-ink/50">[ What we do ]</p>
            <SplitReveal className="display display-lg">Seven disciplines, one studio</SplitReveal>
          </div>
          <p className="max-w-[380px] text-[15.5px] leading-relaxed text-ink/60 md:col-span-4 md:col-start-9">
            Take the full service, or bring us in for the part you need. Every discipline is led by the same team, from the
            first plan to the last cushion.
          </p>
        </div>
      </section>

      {/* Sticky photo beside a scrolling list of services */}
      <section className="bg-bone pb-24 pt-16 text-ink md:pb-32 md:pt-24">
        <div className="wrap grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[22px] bg-ink/10">
              {services.map((s, i) => (
                <div
                  key={s.slug}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)] ${
                    active === i ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
                  }`}
                >
                  <Photo id={IMAGE_FOR[s.slug] ?? projects[i].images[0]} alt={`${s.title} by LONORA`} sizes="(min-width: 768px) 40vw, 100vw" />
                </div>
              ))}
              <span className="glass absolute bottom-5 left-5 rounded-full px-3 py-1 text-[11.5px] uppercase tracking-[0.12em] text-white">
                {services[active].index} · {services[active].title}
              </span>
            </div>
          </div>

          <div className="md:col-span-7">
            {services.map((s, i) => (
              <article
                key={s.slug}
                id={s.slug}
                data-index={i}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className={`scroll-mt-28 border-t border-ink/15 py-12 transition-opacity duration-500 md:py-16 ${
                  active === i ? "md:opacity-100" : "md:opacity-40"
                }`}
              >
                <div className="mb-8 aspect-[4/3] overflow-hidden rounded-[18px] md:hidden">
                  <Photo id={IMAGE_FOR[s.slug] ?? projects[i].images[0]} alt={`${s.title} by LONORA`} sizes="100vw" />
                </div>
                <div className="flex items-baseline gap-5">
                  <span className="text-[13px] tracking-[0.14em] text-terracotta">{s.index}</span>
                  <h2 className="display text-[clamp(2rem,3.6vw,3.4rem)] leading-none">{s.title}</h2>
                </div>
                <RevealGroup>
                  <p data-reveal className="mt-6 max-w-[540px] text-[16.5px] leading-relaxed text-ink/70">
                    {s.description}
                  </p>
                  <p data-reveal className="mt-8 text-[11.5px] uppercase tracking-[0.16em] text-ink/45">What&apos;s included</p>
                  <ul data-reveal className="mt-3 grid max-w-[560px] gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex items-baseline gap-3 text-[15px] text-ink/80">
                        <span aria-hidden className="text-terracotta">—</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div data-reveal className="mt-8">
                    <TLink href="/contact" className="btn btn-dark">
                      Enquire about {s.title.toLowerCase()}
                    </TLink>
                  </div>
                </RevealGroup>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProcessTimeline tone="light" />
      <Faq />
    </>
  );
}
