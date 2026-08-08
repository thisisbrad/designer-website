"use client";

import Link from "next/link";
import { services } from "@/data/services";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";

export default function Services() {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      id="services"
      ref={ref}
      aria-labelledby="services-heading"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading
        id="services-heading"
        eyebrow="03 — Services"
        title="What I do"
        description="Six disciplines, one person, zero hand-off loss. Engagements run from focused sprints to full product builds."
      />

      <ul className="border-t border-line">
        {services.map((service) => (
          <li key={service.index} data-reveal className="group border-b border-line">
            <Link
              href={`/services/${service.slug}`}
              data-cursor="hover"
              className="grid gap-2 py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-10"
            >
              <span className="font-mono text-xs text-muted md:col-span-1">
                ({service.index})
              </span>
              <h3 className="font-display text-2xl font-medium tracking-tight transition-all duration-500 group-hover:translate-x-3 group-hover:text-accent md:col-span-5 md:text-4xl">
                {service.title}
              </h3>
              <p className="leading-relaxed text-muted md:col-span-5">
                {service.description}
              </p>
              <span
                aria-hidden
                className="hidden justify-end text-2xl text-muted opacity-0 -translate-x-2 transition-all duration-500 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100 md:col-span-1 md:flex"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
        <Link
          href="/services"
          data-cursor="hover"
          className="transition-colors hover:text-accent"
        >
          Compare all six services ↗
        </Link>
      </p>
    </section>
  );
}
