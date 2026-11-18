"use client";

import { useState, type FormEvent } from "react";
import { contact, services } from "@/lib/content";
import { SplitReveal } from "@/components/Reveal";
import Faq from "@/components/Faq";

const BUDGETS = ["Under $50k", "$50k – $150k", "$150k – $500k", "$500k +", "Not sure yet"];

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactView() {
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(form.entries()), services: picked };
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const field =
    "w-full rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-[15.5px] text-bone placeholder:text-white/40 focus:border-terracotta focus:outline-none transition-colors";

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden bg-espresso pb-24 pt-40 text-bone">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-6 text-cream/80">Contact</p>
            <SplitReveal as="h1" immediate delay={0.2} className="display display-lg">
              Tell us about your space
            </SplitReveal>
            <p className="lede mt-8 max-w-[440px] text-white/70">
              Share a few details and we will reply within two working days to arrange a first conversation.
            </p>
            <div className="relative mt-12 hidden aspect-[4/3] overflow-hidden rounded-[18px] lg:block">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src="/video/lonora-team.mp4"
                poster="/video/lonora-team-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="The LONORA team reviewing floor plans together"
              />
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-6 text-[14px]">
              <div>
                <dt className="text-white/45">Email</dt>
                <dd>
                  <a className="link-line" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-white/45">Phone / WhatsApp</dt>
                <dd>
                  <a className="link-line" href={contact.whatsapp}>
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-white/45">Studio</dt>
                <dd>{contact.address}</dd>
              </div>
              <div>
                <dt className="text-white/45">Hours</dt>
                <dd>{contact.hours}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {status === "sent" ? (
              <div className="glass rounded-[22px] p-10">
                <p className="display display-md">Thank you.</p>
                <p className="mt-4 text-white/70">
                  Your enquiry has been received. We will be in touch within two working days.
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate={false}
                className="relative space-y-8 overflow-hidden rounded-[26px] bg-[#311414] p-7 md:p-10"
              >
                <div className="relative">
                  <div>
                    <p className="display text-[clamp(1.5rem,2.2vw,2rem)] leading-none">Start a project</p>
                    <p className="mt-2 text-[13.5px] text-white/55">Takes about two minutes. We reply within two working days.</p>
                  </div>
                </div>
                <fieldset className="relative">
                  <legend className="eyebrow mb-4 text-white/50">I&apos;m interested in</legend>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        aria-pressed={picked.includes(s.title)}
                        onClick={() => toggle(s.title)}
                        className={`rounded-full border px-4 py-2 text-[13.5px] transition-colors duration-300 ${
                          picked.includes(s.title)
                            ? "border-terracotta bg-terracotta text-bone"
                            : "border-white/20 text-white/75 hover:border-white/50"
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">Name</span>
                    <input name="name" required autoComplete="name" placeholder="Your name *" className={field} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <input name="email" type="email" required autoComplete="email" placeholder="Email *" className={field} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Phone</span>
                    <input name="phone" type="tel" autoComplete="tel" placeholder="Phone / WhatsApp" className={field} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Project location</span>
                    <input name="location" placeholder="Project location" className={field} />
                  </label>
                </div>
                <fieldset>
                  <legend className="eyebrow mb-4 text-white/50">Budget</legend>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <label key={b} className="cursor-pointer">
                        <input type="radio" name="budget" value={b} className="peer sr-only" />
                        <span className="block rounded-full border border-white/20 px-4 py-2 text-[13.5px] text-white/75 transition-colors peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta">
                          {b}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="sr-only">Message</span>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about the space, timing and what you would like to change *"
                    className={`${field} resize-none !rounded-[22px]`}
                  />
                </label>
                {/* honeypot */}
                <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <div className="flex flex-wrap items-center gap-5">
                  <button type="submit" disabled={status === "sending"} className="btn btn-solid disabled:opacity-60">
                    {status === "sending" ? "Sending…" : "Send enquiry"}
                  </button>
                  {status === "error" && <p className="text-[14px] text-terracotta">{error}</p>}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      <Faq />
    </>
  );
}
