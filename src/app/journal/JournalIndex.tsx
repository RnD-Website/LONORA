"use client";

import { posts } from "@/lib/content";
import { SplitReveal, RevealGroup } from "@/components/Reveal";
import { TLink } from "@/components/Transition";
import { Photo } from "@/components/Photo";

export default function JournalIndex() {
  const [lead, ...rest] = posts;
  return (
    <>
      <section className="bg-bone pb-24 pt-40 text-ink">
        <div className="wrap">
          <p className="eyebrow mb-6 text-ink/60">Journal</p>
          <SplitReveal as="h1" immediate delay={0.2} className="display display-xl">
            Notes from the studio
          </SplitReveal>

          <TLink href={`/journal/${lead.slug}`} data-cursor="Read" className="group mt-20 grid gap-8 md:grid-cols-12">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-ink/10 md:col-span-8">
              <Photo id={lead.image} alt={lead.title} sizes="(min-width: 768px) 66vw, 100vw" priority className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]" />
            </div>
            <div className="flex flex-col justify-end md:col-span-4">
              <p className="text-[12.5px] uppercase tracking-[0.12em] text-ink/50">
                {lead.category} · {lead.date} · {lead.read}
              </p>
              <h2 className="display display-md mt-3">{lead.title}</h2>
              <p className="mt-4 text-[15.5px] text-ink/65">{lead.excerpt}</p>
              <span className="link-line mt-6 self-start text-[14px] font-medium">Read article</span>
            </div>
          </TLink>

          <RevealGroup className="mt-24 grid gap-12 border-t border-ink/15 pt-16 md:grid-cols-2">
            {rest.map((p, i) => (
              <TLink key={p.slug} href={`/journal/${p.slug}`} data-reveal data-delay={i * 0.1} data-cursor="Read" className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-ink/10">
                  <Photo id={p.image} alt={p.title} sizes="(min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]" />
                </div>
                <p className="mt-5 text-[12.5px] uppercase tracking-[0.12em] text-ink/50">
                  {p.category} · {p.date} · {p.read}
                </p>
                <h3 className="display mt-2 text-[28px]">{p.title}</h3>
                <p className="mt-2 text-[15px] text-ink/60">{p.excerpt}</p>
              </TLink>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
