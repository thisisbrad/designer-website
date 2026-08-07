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
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    // Desktop: pin the section and scrub the track horizontally.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.querySelector("[data-pin]"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Image parallax inside the horizontal container.
      track.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: -7 },
          {
            xPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });
    });

    // Smaller screens: simple vertical card reveals.
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      track.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={sectionRef} aria-labelledby="work-heading">
      <div className="mx-auto max-w-[1400px] px-6 pt-28 md:px-10 md:pt-40">
        <SectionHeading
          id="work-heading"
          eyebrow="01 — Selected work"
          title="Featured projects"
          description="Four case studies spanning brand systems, product launches and interactive experiences — each designed and built end to end."
        />
      </div>

      <div data-pin className="lg:h-svh lg:overflow-hidden">
        <div
          ref={trackRef}
          className="flex flex-col gap-20 px-6 pb-24 md:px-10 lg:h-svh lg:w-max lg:flex-row lg:items-center lg:gap-[6vw] lg:px-[8vw] lg:pb-0"
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}

          <div
            data-card
            className="flex w-full shrink-0 flex-col items-start justify-center gap-6 lg:w-[34vw]"
          >
            <p className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
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
        </div>
      </div>
    </section>
  );
}
