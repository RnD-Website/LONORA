"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import PageHero from "@/components/PageHero";
import ProjectCard from "@/components/ProjectCard";

const FILTERS = ["All", "Residential", "Commercial"] as const;

export default function ProjectsIndex() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const grid = useRef<HTMLDivElement>(null);
  const list = useMemo(() => (filter === "All" ? projects : projects.filter((p) => p.category === filter)), [filter]);

  useEffect(() => {
    if (!grid.current) return;
    gsap.fromTo(
      grid.current.children,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 1.2, onComplete: () => ScrollTrigger.refresh() },
    );
  }, [filter]);

  return (
    <>
      <div className="bg-espresso">
        <PageHero
          eyebrow={`Work · ${projects.length} projects`}
          title="Spaces we have composed"
          intro="Homes, villas, restaurants, boutiques and workplaces. Every project is rendered as a live interior: hover to move through it."
        >
          <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`btn h-10 text-[13.5px] ${filter === f ? "btn-solid" : "btn-ghost text-bone"}`}
              >
                {f}
                <span className="text-[11px] opacity-60">
                  {f === "All" ? projects.length : projects.filter((p) => p.category === f).length}
                </span>
              </button>
            ))}
          </div>
        </PageHero>
      </div>
      <section className="bg-espresso pb-32 text-bone">
        <div ref={grid} className="wrap grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-24">
          {list.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={projects.indexOf(p)}
              className={i % 2 === 1 ? "md:mt-40" : ""}
              aspect={i % 3 === 0 ? "aspect-[4/5]" : "aspect-[5/4]"}
            />
          ))}
        </div>
      </section>
    </>
  );
}
