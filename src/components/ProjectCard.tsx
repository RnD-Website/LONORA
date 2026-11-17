"use client";

import type { Project } from "@/lib/content";
import { Photo } from "./Photo";
import { TLink } from "./Transition";

export default function ProjectCard({
  project,
  index,
  className = "",
  aspect = "aspect-[4/5]",
}: {
  project: Project;
  index: number;
  className?: string;
  aspect?: string;
}) {
  return (
    <TLink
      href={`/projects/${project.slug}`}
      data-cursor="View"
      className={`group block ${className}`}
    >
      <div className={`relative overflow-hidden rounded-[18px] bg-black/20 ${aspect}`}>
        <Photo
          id={project.images[0]}
          alt={`${project.title}, ${project.type.toLowerCase()} in ${project.location}`}
          sizes="(min-width: 768px) 38vw, 75vw"
          className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-[18px] ring-1 ring-inset ring-white/10" />
        <div className="pointer-events-none absolute left-4 top-4 z-[2] flex gap-2">
          <span className="glass rounded-full px-3 py-1 text-[11.5px] uppercase tracking-[0.12em] text-white">
            {project.category}
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 z-[2] text-[12px] text-white/80">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="display text-[20px] md:text-[22px]">{project.title}</h3>
          <p className="mt-1 text-[13.5px] opacity-60">
            {project.type} · {project.location}
          </p>
        </div>
        <span className="mt-1 shrink-0 text-[13px] opacity-60">{project.area}</span>
      </div>
    </TLink>
  );
}
