"use client";

import type { ReactNode } from "react";
import type { RoomPreset } from "@/lib/content";
import { SplitReveal } from "./Reveal";
import RoomView from "./three/RoomView";
import { Photo } from "./Photo";

/** Inner-page hero: optional live 3D backdrop + oversized editorial title. */
export default function PageHero({
  eyebrow,
  title,
  intro,
  room,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  room?: RoomPreset;
  /** Photo backdrop (Unsplash id or /public path); used instead of a 3D room. */
  image?: string;
  children?: ReactNode;
}) {
  const backdrop = Boolean(room || image);
  return (
    <section className={`relative flex min-h-[86svh] flex-col justify-end overflow-hidden pb-14 pt-40 ${backdrop ? "text-bone" : ""}`}>
      {backdrop && (
        <>
          {image ? (
            <div className="absolute inset-0">
              <Photo id={image} alt="" priority />
            </div>
          ) : (
            room && <RoomView preset={room} mode="look" fov={48} quality="low" className="absolute inset-0" />
          )}
          <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(12,9,7,0.35),rgba(12,9,7,0.1)_40%,rgba(12,9,7,0.75))]" />
        </>
      )}
      <div className="relative z-[3] wrap">
        <p className="eyebrow mb-6 text-cream [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]">{eyebrow}</p>
        <SplitReveal as="h1" immediate delay={0.2} className="display display-xl max-w-[16ch]">
          {title}
        </SplitReveal>
        {intro && <p className="lede mt-8 max-w-[560px] opacity-75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
