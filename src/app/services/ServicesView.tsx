"use client";

import { projects, services } from "@/lib/content";
import PageHero from "@/components/PageHero";
import RoomView from "@/components/three/RoomView";
import { RevealGroup, SplitReveal } from "@/components/Reveal";
import { ProcessTimeline } from "@/components/home/Sections";
import Faq from "@/components/Faq";
import { TLink } from "@/components/Transition";

// Each service is illustrated by a live interior that represents it.
const ROOM_FOR: Record<string, number> = {
  "interior-design": 0,
  "residential-interiors": 2,
  "commercial-interiors": 3,
  "space-planning": 5,
  "furniture-selection": 6,
  "3d-visualization": 1,
  renovation: 4,
};

export default function ServicesView() {
  return (
    <>
      <div className="bg-espresso">
        <PageHero
          eyebrow="Services"
          title="From first sketch to final cushion"
          intro="Seven disciplines under one roof, so your project is designed, visualised, sourced and delivered by one team."
          room={projects[7].room}
        />
      </div>

      <section className="bg-bone pb-10 pt-28 text-ink md:pt-40">
        <div className="wrap">
          {services.map((s, i) => {
            const room = projects[ROOM_FOR[s.slug] ?? i].room;
            const flip = i % 2 === 1;
            return (
              <div
                key={s.slug}
                id={s.slug}
                className="grid scroll-mt-28 gap-10 border-t border-ink/15 py-16 md:grid-cols-12 md:gap-12 md:py-24"
              >
                <div className={`md:col-span-6 ${flip ? "md:order-2" : ""}`}>
                  <div className="relative aspect-[5/4] overflow-hidden rounded-[18px] bg-ink/10">
                    <RoomView preset={room} shot={(i + 1) % 3} />
                  </div>
                </div>
                <RevealGroup className={`flex flex-col justify-center md:col-span-6 ${flip ? "md:order-1" : ""}`}>
                  <p data-reveal className="text-[13px] text-ink/45">
                    {s.index} / {String(services.length).padStart(2, "0")}
                  </p>
                  <SplitReveal className="display display-lg mt-3">{s.title}</SplitReveal>
                  <p data-reveal className="mt-6 max-w-[520px] text-[16.5px] leading-relaxed text-ink/70">
                    {s.description}
                  </p>
                  <ul data-reveal className="mt-8 grid max-w-[520px] grid-cols-1 gap-x-6 sm:grid-cols-2">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-3 border-b border-ink/10 py-3 text-[14.5px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
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
              </div>
            );
          })}
        </div>
      </section>

      <ProcessTimeline tone="light" />
      <Faq />
    </>
  );
}
