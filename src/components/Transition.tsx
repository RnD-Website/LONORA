"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

/**
 * Page transitions: a curtain rises over the page, the route changes behind
 * it, then the curtain lifts away revealing the new page.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const first = useRef(true);

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return;
      if (href === pathname) return;
      if (prefersReducedMotion() || !curtain.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      gsap
        .timeline()
        .set(curtain.current, { yPercent: 100, display: "flex" })
        .to(curtain.current, { yPercent: 0, duration: 0.85, ease: "expo.inOut" })
        .fromTo(label.current, { yPercent: 110 }, { yPercent: 0, duration: 0.7 }, "-=0.45")
        .add(() => router.push(href));
    },
    [pathname, router],
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!busy.current || !curtain.current) return;
    const tl = gsap
      .timeline({ delay: 0.15, onComplete: () => void (busy.current = false) })
      .to(label.current, { yPercent: -110, duration: 0.5, ease: "expo.in" })
      .to(curtain.current, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15")
      .set(curtain.current, { display: "none" });
    return () => void tl.kill();
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="fixed inset-0 z-[90] hidden items-center justify-center bg-espresso"
      >
        <div className="overflow-hidden">
          <div ref={label} className="display display-md text-cream">
            LONORA
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export const useTransition = () => useContext(TransitionContext);

type TLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export function TLink({ href, onClick, children, ...rest }: TLinkProps) {
  const { navigate } = useTransition();
  const url = typeof href === "string" ? href : href.pathname ?? "/";
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (url.startsWith("http") || url.startsWith("#") || url.startsWith("mailto")) return;
        e.preventDefault();
        navigate(url);
      }}
    >
      {children}
    </Link>
  );
}
