"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Shared mutable state read by WebGL scenes inside useFrame (no re-renders). */
export const scrollState = {
  /** 0..1 progress of the home journey */
  journey: 0,
  /** lenis velocity, used for subtle motion blur / skew */
  velocity: 0,
  pointer: { x: 0, y: 0 },
};

export { gsap, ScrollTrigger, SplitText, useGSAP };
