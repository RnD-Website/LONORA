"use client";

import { useRef, useState } from "react";
import { faqs } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { SplitReveal } from "./Reveal";

function Item({ q, a, open, onToggle, id }: { q: string; a: string; open: boolean; onToggle: () => void; id: string }) {
  const body = useRef<HTMLDivElement>(null);
  return (
    <li className="border-b border-ink/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          onToggle();
          if (body.current)
            gsap.to(body.current, { height: open ? 0 : "auto", duration: 0.8, ease: "expo.inOut" });
        }}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="display text-[18px] leading-tight md:text-[22px]">{q}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-transform duration-500 ${open ? "rotate-45 bg-ink text-bone" : ""}`}
        >
          +
        </span>
      </button>
      <div id={id} ref={body} className="h-0 overflow-hidden">
        <p className="max-w-[680px] pb-7 text-[15.5px] leading-relaxed text-ink/65">{a}</p>
      </div>
    </li>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-bone py-28 text-ink md:py-40">
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow">Questions</p>
          <SplitReveal className="display display-md mt-6">Asked often</SplitReveal>
        </div>
        <ul className="border-t border-ink/15 md:col-span-8">
          {faqs.map((f, i) => (
            <Item
              key={f.q}
              id={`faq-${i}`}
              q={f.q}
              a={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
