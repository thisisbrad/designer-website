"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";
import MagneticButton from "./MagneticButton";
import { scrollToSection } from "./SmoothScroll";

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      section.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          }
        );
      });

      section.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-heading"
      className="mx-auto max-w-[1400px] px-6 pt-28 pb-24 md:px-10 md:pt-40 md:pb-32"
    >
      <SectionHeading
        id="work-heading"
        eyebrow="01 — Selected work"
        title="Featured projects"
        description="Four case studies spanning search-driven redesigns, conversion-focused launches and AI products — each designed, built and measured end to end."
      />

      <div className="flex flex-col gap-24 md:gap-32">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} flip={i % 2 === 1} />
        ))}
      </div>

      <div
        data-card
        className="mt-24 flex flex-col items-center gap-6 text-center md:mt-32"
      >
        <p className="max-w-[24ch] font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
          Have a project that deserves this kind of attention?
        </p>
        <MagneticButton
          href="#contact"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#contact");
          }}
        >
          Start a conversation
          <span aria-hidden>↗</span>
        </MagneticButton>
      </div>
    </section>
  );
}
