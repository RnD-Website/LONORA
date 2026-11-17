"use client";

import { useState } from "react";
import { getProject, posts, type Post } from "@/lib/content";
import { SplitReveal, RevealGroup } from "@/components/Reveal";
import { TLink } from "@/components/Transition";
import { Photo, RevealPhoto } from "@/components/Photo";

function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-y border-ink/12 py-6">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#311414] font-[family-name:var(--font-display)] text-[15px] text-bone">
          L
        </span>
        <div>
          <p className="text-[14px] font-medium">Written by LONORA Studio</p>
          <p className="text-[13px] text-ink/55">Interior architecture · Notes from practice</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] uppercase tracking-[0.14em] text-ink/45">Share</span>
        <button type="button" onClick={copy} className="btn btn-ghost-ink h-10 text-[13px]" aria-label={`Copy link to ${title}`}>
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export default function Article({ post }: { post: Post; next?: Post }) {
  const project = getProject(post.project);
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="bg-bone text-ink">
      <header className="wrap pb-16 pt-40">
        <p className="eyebrow mb-6 text-ink/60">
          {post.category} · {post.date} · {post.read} read
        </p>
        <SplitReveal as="h1" immediate delay={0.2} className="display display-xl max-w-[14ch]">
          {post.title}
        </SplitReveal>
        <p className="lede mt-8 max-w-[600px] text-ink/65">{post.excerpt}</p>
      </header>
      <div className="wrap">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-ink/10">
          <Photo id={post.image} alt={post.title} priority />
        </div>
      </div>
      <RevealGroup className="wrap mx-auto max-w-[760px] space-y-7 py-24 text-[18px] leading-[1.7] text-ink/80">
        {post.body.map((para, i) => (
          <p key={i} data-reveal className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-[72px] first-letter:leading-[0.85]" : ""}>
            {para}
          </p>
        ))}
      </RevealGroup>

      {/* Pull quote */}
      <section className="wrap pb-24 md:pb-32">
        <figure className="mx-auto max-w-[1000px] border-l-2 border-terracotta pl-6 md:pl-12">
          <SplitReveal as="p" className="display text-[clamp(1.9rem,4vw,3.6rem)] leading-[1.06]">
            {`“${post.quote}”`}
          </SplitReveal>
          <figcaption className="mt-6 text-[12px] uppercase tracking-[0.16em] text-ink/45">LONORA Studio</figcaption>
        </figure>
      </section>

      {/* Supporting images */}
      <section className="wrap pb-24 md:pb-32">
        <div className="grid gap-4 md:grid-cols-12 md:gap-6">
          <RevealPhoto id={post.gallery[0]} alt={post.gallerycaption} sizes="(min-width: 768px) 58vw, 100vw" aspect="aspect-[4/3]" className="md:col-span-7" />
          <RevealPhoto id={post.gallery[1]} alt={post.gallerycaption} sizes="(min-width: 768px) 42vw, 100vw" aspect="aspect-[4/5]" className="md:col-span-5 md:mt-24" />
        </div>
        <p className="mt-5 max-w-[520px] text-[13.5px] text-ink/50">{post.gallerycaption}</p>
      </section>

      {/* Key takeaways */}
      <section className="bg-cream py-24 md:py-32">
        <div className="wrap">
          <div className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
            <SplitReveal className="display display-md md:col-span-6">Key takeaways</SplitReveal>
            <p className="max-w-[380px] text-[15px] text-ink/60 md:col-span-4 md:col-start-9">
              The short version, for anyone planning a home or a commercial space.
            </p>
          </div>
          <RevealGroup className="grid gap-4 md:grid-cols-3 md:gap-6">
            {post.takeaways.map((t, i) => (
              <div key={i} data-reveal data-delay={i * 0.08} className="flex min-h-[220px] flex-col justify-between rounded-[18px] bg-bone p-7">
                <span className="display text-[44px] leading-none text-terracotta">0{i + 1}</span>
                <p className="mt-8 text-[17px] leading-snug">{t}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* In practice: related project */}
      {project && (
        <section className="wrap py-24 md:py-32">
          <TLink href={`/projects/${project.slug}`} data-cursor="View" className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] md:col-span-7">
              <Photo
                id={project.images[0]}
                alt={`${project.title}, ${project.type.toLowerCase()} in ${project.location}`}
                sizes="(min-width: 768px) 58vw, 100vw"
                className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />
            </div>
            <div className="md:col-span-5">
              <p className="eyebrow text-ink/50">See it in practice</p>
              <h2 className="display display-md mt-4">{project.title}</h2>
              <p className="mt-3 text-[14px] text-ink/55">
                {project.type} · {project.location} · {project.area}
              </p>
              <p className="mt-6 max-w-[420px] text-[16px] leading-relaxed text-ink/70">{project.summary}</p>
              <span className="btn btn-ghost-ink mt-8">View the project</span>
            </div>
          </TLink>
        </section>
      )}

      {/* Byline + share */}
      <div className="wrap pb-24 md:pb-32">
        <ShareRow title={post.title} />
      </div>

      {/* More from the journal */}
      <section className="wrap pb-24 md:pb-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <SplitReveal className="display display-md">More from the journal</SplitReveal>
          <TLink href="/journal" className="btn btn-ghost-ink h-10 shrink-0 text-[13.5px]">
            All articles
          </TLink>
        </div>
        <RevealGroup className="grid gap-10 md:grid-cols-2 md:gap-6">
          {more.map((p, i) => (
            <TLink key={p.slug} href={`/journal/${p.slug}`} data-reveal data-delay={i * 0.08} data-cursor="Read" className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-ink/10">
                <Photo
                  id={p.image}
                  alt={p.title}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
              </div>
              <p className="mt-5 text-[12.5px] uppercase tracking-[0.12em] text-ink/50">
                {p.category} · {p.read}
              </p>
              <h3 className="display mt-2 text-[26px] leading-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] text-ink/60">{p.excerpt}</p>
            </TLink>
          ))}
        </RevealGroup>
      </section>

    </article>
  );
}
