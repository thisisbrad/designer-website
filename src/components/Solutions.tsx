"use client";

import { solutions } from "@/data/solutions";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";
import MagneticButton from "./MagneticButton";
import { scrollToSection } from "./SmoothScroll";

export default function Solutions() {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      id="solutions"
      ref={ref}
      aria-labelledby="solutions-heading"
      className="mx-auto max-w-[1400px] px-6 pt-28 pb-24 md:px-10 md:pt-40 md:pb-32"
    >
      <SectionHeading
        id="solutions-heading"
        eyebrow="01 — The plan"
        title="A straight line from search to sale"
        description="No retainers for vague brand awareness. One plan with three moving parts — each one measurable, each one built to compound."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {solutions.map((solution) => (
          <article
            key={solution.index}
            data-reveal
            data-cursor="hover"
            aria-label={solution.phase}
            className="group flex flex-col rounded-2xl border border-line bg-ink-2 p-8 transition-colors duration-500 hover:border-accent/40"
          >
            <p className="flex items-baseline justify-between font-mono text-xs tracking-[0.25em] uppercase">
              <span className="text-muted">Phase {solution.index}</span>
              <span className="text-accent">{solution.phase}</span>
            </p>

            <h3 className="mt-6 font-display text-3xl font-medium tracking-tight">
              {solution.title}
            </h3>

            <p className="mt-4 leading-relaxed text-muted">{solution.description}</p>

            <ul
              className="mt-8 flex flex-col border-t border-line"
              aria-label={`${solution.phase} deliverables`}
            >
              {solution.deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-line py-3 text-sm text-paper/80"
                >
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-auto pt-8 font-mono text-[11px] leading-relaxed tracking-[0.2em] text-muted uppercase">
              {solution.outcome}
            </p>
          </article>
        ))}
      </div>

      <div
        data-reveal
        className="mt-20 flex flex-col items-center gap-6 text-center md:mt-24"
      >
        <p className="max-w-[26ch] font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
          Want to know where your site stands today?
        </p>
        <MagneticButton
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#contact");
          }}
        >
          Get a free audit
          <span aria-hidden>↗</span>
        </MagneticButton>
      </div>
    </section>
  );
}
