"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    n: "01",
    title: "Discover",
    description:
      "Workshops, analytics deep-dives and a full SEO audit. We define what success looks like — and which searches should find you — before anything gets designed.",
    meta: "Strategy · SEO Audit · Scope",
  },
  {
    n: "02",
    title: "Design",
    description:
      "Wireframes to high-fidelity screens, with content and keyword strategy built into the layout from the start — designed in systems and reviewed in the browser early.",
    meta: "Direction · UI · Content",
  },
  {
    n: "03",
    title: "Build",
    description:
      "Production code from day one. Clean components, semantic markup and structured data, with performance and accessibility budgets enforced.",
    meta: "Next.js · CMS · Schema",
  },
  {
    n: "04",
    title: "Optimize",
    description:
      "Technical SEO pass, Core Web Vitals tuning, copy polish and conversion testing — the last ten percent that compounds long after launch.",
    meta: "SEO · Vitals · CRO",
  },
  {
    n: "05",
    title: "Launch",
    description:
      "Zero-drama deploys with analytics and Search Console wired, then ongoing reporting, experiments and AI automations as you grow.",
    meta: "Deploy · Measure · Grow",
  },
];

export default function Process() {
  const sectionRef = useSectionReveal<HTMLElement>();
  const listRef = useRef<HTMLOListElement>(null);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const progress = list.querySelector("[data-progress]");
    if (!progress) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        progress,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 75%",
            end: "bottom 70%",
            scrub: 0.5,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading
        id="process-heading"
        eyebrow="04 — Process"
        title="How it comes together"
        description="A clear, collaborative path from first call to launch day — no black boxes, no surprise invoices."
      />

      <ol ref={listRef} className="relative border-l border-line pl-10 md:pl-16">
        <div
          aria-hidden
          data-progress
          className="absolute top-0 bottom-0 left-[-1px] w-px origin-top scale-y-0 bg-accent"
        />
        {steps.map((step) => (
          <li key={step.n} data-reveal className="relative pb-16 last:pb-0">
            <span
              aria-hidden
              className="absolute top-2.5 left-[-45px] size-[9px] rounded-full border border-accent bg-ink md:left-[-69px]"
            />
            <div className="flex items-baseline gap-5">
              <span className="font-mono text-sm text-accent">{step.n}</span>
              <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                {step.title}
              </h3>
            </div>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              {step.description}
            </p>
            <p className="mt-4 font-mono text-[11px] tracking-[0.25em] text-muted/70 uppercase">
              {step.meta}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
