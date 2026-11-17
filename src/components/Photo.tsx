"use client";
/* eslint-disable @next/next/no-img-element -- Unsplash's CDN resizes for us via srcSet. */

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

const WIDTHS = [640, 960, 1400, 2000, 2600];

export function unsplash(id: string, w: number, h?: number) {
  const size = h ? `&h=${h}&fit=crop` : "";
  return `https://images.unsplash.com/photo-${id}?auto=format&q=72&w=${w}${size}`;
}

/** Responsive Unsplash image (free licence), or a local file under /public. */
export function Photo({
  id,
  alt,
  sizes = "100vw",
  className = "",
  priority = false,
}: {
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  // Local files (e.g. "/images/ember-lounge.jpg") are served as-is; anything else is an Unsplash id.
  const local = id.startsWith("/");
  return (
    <img
      src={local ? id : unsplash(id, 1400)}
      srcSet={local ? undefined : WIDTHS.map((w) => `${unsplash(id, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/**
 * Editorial image block: the frame unmasks on scroll while the photo
 * inside drifts slower than the page for a subtle parallax depth.
 */
export function RevealPhoto({
  id,
  alt,
  sizes,
  className = "",
  aspect = "aspect-[16/9]",
  caption,
}: {
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  aspect?: string;
  caption?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !frame.current) return;
      const img = frame.current.querySelector("img");
      gsap.fromTo(
        frame.current,
        { clipPath: "inset(12% 6% 12% 6% round 18px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 18px)",
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top 95%", end: "top 35%", scrub: true },
        },
      );
      gsap.fromTo(
        img,
        { yPercent: -8, scale: 1.18 },
        {
          yPercent: 8,
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: frame },
  );

  return (
    <figure className={className}>
      <div ref={frame} className={`relative overflow-hidden rounded-[18px] bg-black/10 ${aspect}`}>
        <Photo id={id} alt={alt} sizes={sizes} />
      </div>
      {caption && <figcaption className="mt-3 text-[12.5px] opacity-50">{caption}</figcaption>}
    </figure>
  );
}
