"use client";

import { useEffect, useRef } from "react";
import { TLink } from "./Transition";
import { contact, nav, services } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  // Size the wordmark so its letters exactly span the content width.
  useEffect(() => {
    const el = mark.current;
    if (!el) return;
    const fit = () => {
      const letters = [...el.querySelectorAll<HTMLElement>("[data-letter]")];
      const style = getComputedStyle(el);
      const avail = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      el.style.fontSize = "100px";
      const total = letters.reduce((w, l) => w + l.getBoundingClientRect().width, 0);
      if (total > 0) el.style.fontSize = `${Math.floor((100 * avail * 0.94) / total)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-wordmark] span",
        { yPercent: 100 },
        {
          yPercent: 0,
          stagger: 0.05,
          ease: "expo.out",
          duration: 1.4,
          scrollTrigger: { trigger: "[data-wordmark]", start: "top 95%" },
        },
      );
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative overflow-hidden bg-espresso pt-20 text-bone md:pt-28">
      <div className="wrap grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display display-md text-cream">Let&apos;s compose your space.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TLink href="/contact" className="btn btn-solid">
              Start a project
            </TLink>
            <a href={contact.whatsapp} className="btn btn-ghost">
              WhatsApp
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-[14px] sm:grid-cols-3 md:col-span-7">
          <div>
            <p className="eyebrow mb-4 text-white/40">Studio</p>
            <ul className="space-y-2">
              {nav.map((n) => (
                <li key={n.href}>
                  <TLink href={n.href} className="link-line">
                    {n.label}
                  </TLink>
                </li>
              ))}
              <li>
                <TLink href="/contact" className="link-line">
                  Contact
                </TLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-white/40">Services</p>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <TLink href={`/services#${s.slug}`} className="link-line">
                    {s.title}
                  </TLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-white/40">Contact</p>
            <ul className="space-y-2">
              <li>
                <a className="link-line" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
              <li>{contact.phone}</li>
              {contact.socials.map((s) => (
                <li key={s.label}>
                  <a className="link-line" href={s.href}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div ref={mark} data-wordmark aria-hidden className="mt-14 flex justify-between overflow-hidden pb-[0.02em] pt-[0.12em] text-[18vw] wrap md:mt-20">
        {"LONORA".split("").map((c, i) => (
          <span key={i} data-letter className="display block leading-[1] text-cream/95">
            {c}
          </span>
        ))}
      </div>

      <div className="wrap flex flex-col justify-between gap-2 py-6 text-[12.5px] text-white/45 sm:flex-row">
        <span>© 2026 LONORA Interior Architecture</span>
        <span>Interiors composed like architecture</span>
      </div>
    </footer>
  );
}
