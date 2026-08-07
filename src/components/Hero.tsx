"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { INTRO_DELAY, useIsomorphicLayoutEffect } from "@/lib/utils";
import AnimatedText from "./AnimatedText";
import MagneticButton from "./MagneticButton";
import { scrollToSection } from "./SmoothScroll";

const ThreeScene = dynamic(() => import("./ThreeScene"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-hero-fade]");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        targets,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: INTRO_DELAY + 0.5,
        }
      );
    });
    return () => mm.revert();
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      <ThreeScene className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-70 lg:w-3/5" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-32 pb-16 md:px-10">
        <p
          data-hero-fade
          className="mb-8 font-mono text-xs tracking-[0.3em] text-muted uppercase"
        >
          Websites · SEO · AI solutions
        </p>

        <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,7vw,6.75rem)] leading-[1.04] font-medium tracking-tight">
          <AnimatedText trigger="load" delay={INTRO_DELAY} className="block">
            Designing digital
          </AnimatedText>
          <AnimatedText trigger="load" delay={INTRO_DELAY + 0.12} className="block">
            experiences with code,
          </AnimatedText>
          <AnimatedText
            trigger="load"
            delay={INTRO_DELAY + 0.24}
            className="block text-accent"
          >
            search &amp; AI.
          </AnimatedText>
        </h1>

        <p data-hero-fade className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          I build fast, search-optimized websites and practical AI solutions
          for businesses that want to be found, convert more visitors and
          automate the busywork.
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href="#solutions" onClick={go("#solutions")}>
            See the Plan
            <span aria-hidden>↗</span>
          </MagneticButton>
          <MagneticButton href="#audit" variant="outline" onClick={go("#audit")}>
            Get a Free Audit
          </MagneticButton>
        </div>
      </div>

      <div
        data-hero-fade
        className="relative z-10 mx-auto flex w-full max-w-[1400px] items-end justify-between px-6 pb-8 font-mono text-[11px] tracking-[0.25em] text-muted uppercase md:px-10"
      >
        <span>Florida / Remote</span>
        <span aria-hidden className="motion-safe:animate-pulse-dot">
          Scroll ↓
        </span>
        <span>Est. 2017</span>
      </div>
    </section>
  );
}
