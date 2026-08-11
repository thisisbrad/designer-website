"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { INTRO_DELAY, useIsomorphicLayoutEffect } from "@/lib/utils";
import AnimatedText from "./AnimatedText";
import MagneticButton from "./MagneticButton";
import { scrollToSection } from "./SmoothScroll";

const ThreeScene = dynamic(() => import("./ThreeScene"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  /* The WebGL scene costs ~2.6s of main-thread blocking on a throttled phone,
     for a canvas the scrim below covers most of anyway. Phones get the CSS
     approximation instead; tablets and up get the real thing. */
  const showScene = useMediaQuery("(min-width: 768px)");

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
      /* Stays dark on a light page by design: the scene is a night
         scene, and the band gives the page its cinematic opening. */
      className="theme-dark relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* Phones don't mount the WebGL scene, so approximate the lantern glow in
          CSS for them. Hidden from md up, where it would stack on top of the
          canvas's own light and blow out the area around the tower. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_38%_at_70%_38%,rgba(215,251,68,0.09),transparent_72%)] md:hidden"
      />
      {showScene && (
        <ThreeScene className="pointer-events-none absolute inset-0 opacity-80" />
      )}
      {/* Legibility scrim over the text column, then a vignette so the
          beam fades into the edges instead of hitting a hard canvas cut. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/45 via-45% to-transparent to-75%"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_95%_at_68%_40%,transparent_50%,rgba(10,10,11,0.85)_100%)]"
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

        {/* The free audit carries the solid fill and the first position: it is
            the page's actual conversion and the destination every paid campaign
            points at. "See the plan" stays as the lower-commitment path for
            anyone not ready to hand over an email address. */}
        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton
            href="#audit"
            onClick={go("#audit")}
            analyticsLocation="hero"
          >
            Get a Free Audit
            <span aria-hidden>↗</span>
          </MagneticButton>
          <MagneticButton
            href="#solutions"
            variant="outline"
            onClick={go("#solutions")}
            analyticsLocation="hero"
          >
            See the Plan
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
