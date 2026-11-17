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
          className="display text-[22px] tracking-[0.08em] text-white mix-blend-difference"
        >
          LONORA
        </TLink>

        <nav
          aria-label="Primary"
          className="glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full p-1 md:flex"
        >
          {nav.map((item) => (
            <TLink
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-[13.5px] transition-colors duration-500 ${
                isActive(item.href) ? "bg-white/12 text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </TLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <TLink href="/contact" className="btn btn-solid hidden h-10 text-[13.5px] md:inline-flex">
            Start a project
          </TLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="glass flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] text-white md:hidden"
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
            <div key={item.href} className="overflow-hidden">
              <TLink href={item.href} data-menu-item className="display block text-[13vw] text-cream">
                {item.label}
              </TLink>
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
