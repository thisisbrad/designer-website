"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";

/**
 * Staggered rise-in for every [data-reveal] descendant once the section
 * enters the viewport. Reduced-motion users see content immediately.
 */
export function useSectionReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        targets,
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return ref;
}

/**
 * Subtle scrubbed vertical parallax on every [data-parallax] descendant.
 * The parallax layer should bleed beyond its mask (e.g. -inset-y-[12%])
 * so no gaps appear while it travels.
 */
export function useParallax<T extends HTMLElement>(amount = 10) {
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-parallax]");
    if (!targets.length) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      targets.forEach((t) => {
        gsap.fromTo(
          t,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: t,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    });
    return () => mm.revert();
  }, [amount]);

  return ref;
}
