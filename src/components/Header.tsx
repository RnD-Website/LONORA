"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TLink } from "./Transition";
import { nav, contact } from "@/lib/content";
import { gsap } from "@/lib/gsap";

export default function Header() {
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // "light" when the header sits over a light section, so its elements turn dark.
  const [onLight, setOnLight] = useState(false);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > last && y > 160;
      if (down !== hidden) {
        hidden = down;
        gsap.to(bar.current, { yPercent: down ? -140 : 0, duration: 0.8, ease: "expo.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sample what sits under the bar and switch to dark elements over light backgrounds.
  useEffect(() => {
    let raf = 0;
    const luminance = (c: string) => {
      const m = c.match(/[\d.]+/g);
      if (!m) return null;
      const [r, g, b, a = "1"] = m;
      if (parseFloat(a) < 0.5) return null; // mostly transparent: keep looking
      return (0.2126 * +r + 0.7152 * +g + 0.0722 * +b) / 255;
    };
    const sample = () => {
      raf = 0;
      const header = bar.current;
      if (!header) return;
      const y = header.getBoundingClientRect().height / 2;
      const points = [window.innerWidth * 0.25, window.innerWidth * 0.5, window.innerWidth * 0.75];
      let light = 0;
      for (const x of points) {
        const stack = document.elementsFromPoint(x, y).filter((el) => !header.contains(el));
        let lum: number | null = null;
        for (const el of stack) {
          // Sections can declare their tone explicitly (e.g. photo heroes).
          const tone = el.closest<HTMLElement>("[data-tone]")?.dataset.tone;
          if (tone) {
            lum = tone === "light" ? 1 : 0;
            break;
          }
          if (/^(IMG|VIDEO|CANVAS)$/.test(el.tagName)) {
            lum = 0.3; // photos and film read as dark
            break;
          }
          for (let n: Element | null = el; n && lum === null; n = n.parentElement) {
            lum = luminance(getComputedStyle(n).backgroundColor);
          }
          if (lum !== null) break;
        }
        if ((lum ?? 0) > 0.6) light++;
      }
      setOnLight(light >= 2);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };
    schedule();
    // Re-check once the preloader and page-transition curtain have lifted.
    const timers = [400, 1200, 2500, 4000, 5500].map((ms) => window.setTimeout(sample, ms));
    const onReady = () => [150, 900, 1600].forEach((ms) => timers.push(window.setTimeout(sample, ms)));
    window.addEventListener("lonora:ready", onReady);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("lonora:ready", onReady);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount / route sync
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const links = el.querySelectorAll("[data-menu-item]");
    if (open) {
      gsap
        .timeline()
        .set(el, { display: "flex" })
        .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.inOut" })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 1 }, "-=0.4");
    } else if (el.style.display === "flex") {
      gsap
        .timeline()
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.inOut" })
        .set(el, { display: "none" });
    }
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-50 flex h-[var(--header-h)] items-center justify-between wrap"
      >
        <TLink
          href="/"
          aria-label="LONORA home"
          className={`display text-[22px] tracking-[0.08em] transition-colors duration-500 ${onLight ? "text-ink" : "text-white"}`}
        >
          LONORA
        </TLink>

        <nav
          aria-label="Primary"
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1 transition-colors duration-500 md:flex ${
            onLight ? "glass-light" : "glass"
          }`}
        >
          {nav.map((item) =>
            item.href === null ? (
              <span
                key={item.label}
                className={`cursor-default rounded-full px-4 py-2 text-[13.5px] transition-colors duration-500 ${onLight ? "text-ink/65" : "text-white/70"}`}
              >
                {item.label}
              </span>
            ) : (
            <TLink
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-[13.5px] transition-colors duration-500 ${
                onLight
                  ? isActive(item.href)
                    ? "bg-ink/10 text-ink"
                    : "text-ink/65 hover:text-ink"
                  : isActive(item.href)
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </TLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <TLink
            href="/contact"
            className={`btn hidden h-10 text-[13.5px] transition-colors duration-500 md:inline-flex ${onLight ? "btn-dark" : "btn-solid"}`}
          >
            Start a project
          </TLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] transition-colors duration-500 md:hidden ${
              onLight && !open ? "glass-light text-ink" : "glass text-white"
            }`}
          >
            <span className="relative block h-[8px] w-4">
              <span
                className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1 -rotate-45" : "top-2"}`}
              />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        ref={menu}
        id="mobile-menu"
        className="fixed inset-0 z-40 hidden flex-col justify-between bg-espresso pb-8 pt-28 wrap"
      >
        <nav className="flex flex-col gap-2">
          {[...nav, { label: "Contact", href: "/contact" }].map((item) => (
            <div key={item.label} className="overflow-hidden">
              {item.href === null ? (
                <span data-menu-item className="display block text-[13vw] text-cream">
                  {item.label}
                </span>
              ) : (
                <TLink href={item.href} data-menu-item className="display block text-[13vw] text-cream">
                  {item.label}
                </TLink>
              )}
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-1 text-sm text-white/60">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.whatsapp}>WhatsApp</a>
        </div>
      </div>
    </>
  );
}
