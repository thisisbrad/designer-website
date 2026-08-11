"use client";

import Link from "next/link";
import AnimatedText from "./AnimatedText";
import ContactForm from "./ContactForm";
import { socials } from "@/data/contact";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";

export default function Contact() {
  const ref = useSectionReveal<HTMLElement>();

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
            Tell me about your project — a new site, an SEO push or an AI
            build. I read everything personally and reply within 48 hours.
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
                  className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:text-content"
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

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            <Link href="/contact" className="transition-colors hover:text-accent">
              Full contact details ↗
            </Link>
          </p>
        </div>

        <ContactForm
          idPrefix="home"
          location="home_contact"
          className="lg:col-span-6 lg:col-start-7"
        />
      </div>
    </section>
  );
}
