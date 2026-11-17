"use client";

import { useRef, useState } from "react";
import type { PlanRoom } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";

/** Interactive architectural plan — walls draw in on scroll, rooms light on hover. */
export default function FloorPlan({ rooms, accent }: { rooms: PlanRoom[]; accent: string }) {
  const [active, setActive] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const rects = svg.current?.querySelectorAll<SVGRectElement>("[data-wall]");
      if (!rects) return;
      rects.forEach((r) => {
        const len = r.getTotalLength();
        gsap.fromTo(
          r,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power3.inOut",
            scrollTrigger: { trigger: svg.current, start: "top 80%", once: true },
          },
        );
      });
      gsap.from("[data-label]", {
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        delay: 1.2,
        scrollTrigger: { trigger: svg.current, start: "top 80%", once: true },
      });
    },
    { scope: svg },
  );

  const current = rooms.find((r) => r.label === active);

  return (
    <div>
      <div className="rounded-[18px] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:p-8">
        <svg ref={svg} viewBox="-2 -2 104 74" className="w-full" role="img" aria-label="Floor plan">
          <defs>
            <pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="2" stroke={accent} strokeWidth="0.35" opacity="0.5" />
            </pattern>
          </defs>
          {rooms.map((r) => {
            const on = active === r.label;
            return (
              <g
                key={r.label}
                onMouseEnter={() => setActive(r.label)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(r.label)}
                className="cursor-pointer"
              >
                <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={on ? "url(#hatch)" : "#f7f3ec"} className="transition-[fill] duration-300" />
                <rect data-wall x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#212121" strokeWidth={0.7} />
                <text
                  data-label
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={r.w < 18 ? 2.2 : 2.8}
                  fill={on ? accent : "#212121"}
                  style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}
                >
                  {r.label}
                </text>
              </g>
            );
          })}
          {/* door swings */}
          <path d="M 22 10 A 6 6 0 0 1 28 16" fill="none" stroke="#212121" strokeWidth="0.3" />
          <path d="M 68 34 A 5 5 0 0 0 63 39" fill="none" stroke="#212121" strokeWidth="0.3" />
          <rect x={-2} y={-2} width={104} height={74} fill="none" stroke="#212121" strokeWidth={1.6} />
        </svg>
      </div>
      <p className="mt-4 h-6 text-[14px] text-ink/60">
        {current ? (
          <>
            <span className="font-medium text-ink">{current.label}</span> · approx. {Math.round(current.w * current.h * 0.09)} m²
          </>
        ) : (
          "Hover a room to explore the plan"
        )}
      </p>
    </div>
  );
}
