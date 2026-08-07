"use client";

import { useState } from "react";
import AnimatedText from "./AnimatedText";
import MagneticButton from "./MagneticButton";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";

const socials = [
  { label: "Twitter / X", href: "https://x.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-lg text-paper transition-colors placeholder:text-muted/50 focus:border-accent focus:outline-none";

const labelCls =
  "mb-2 block font-mono text-xs tracking-[0.2em] text-muted uppercase";

export default function Contact() {
  const ref = useSectionReveal<HTMLElement>();
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      ref={ref}
      aria-labelledby="contact-heading"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-muted uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        06 — Contact
      </p>
      <AnimatedText
        as="h2"
        id="contact-heading"
        className="max-w-[14ch] font-display text-[clamp(2.5rem,6.5vw,6rem)] leading-[1.05] font-medium tracking-tight"
      >
        Let&apos;s build something memorable.
      </AnimatedText>

      <div className="mt-16 grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            Tell me about your project — scope, timeline, ambition. I read
            everything personally and reply within 48 hours.
          </p>
          <a
            href="mailto:hello@beltowski.studio"
            className="mt-8 inline-block font-display text-2xl tracking-tight underline decoration-line underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-3xl"
          >
            hello@beltowski.studio
          </a>

          <ul className="mt-12 flex flex-col gap-3" aria-label="Social links">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:text-paper"
                >
                  {social.label}
                  <span
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-12 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
            Currently booking Q3 2026
          </p>
        </div>

        <form
          className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7"
          data-reveal
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className={labelCls}>
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Appleseed"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelCls}>
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@studio.com"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-budget" className={labelCls}>
              Budget
            </label>
            <select id="contact-budget" name="budget" className={inputCls}>
              <option className="bg-ink">€5k — €10k</option>
              <option className="bg-ink">€10k — €25k</option>
              <option className="bg-ink">€25k — €50k</option>
              <option className="bg-ink">€50k+</option>
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" className={labelCls}>
              Project details
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              placeholder="What are we building, and when does it need to exist?"
              className={inputCls}
            />
          </div>

          <div className="flex items-center gap-6">
            <MagneticButton type="submit">
              Send inquiry
              <span aria-hidden>↗</span>
            </MagneticButton>
            {sent && (
              <p role="status" className="text-sm text-accent">
                Thanks — your message is on its way.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
