"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import AnimatedText from "../AnimatedText";
import MagneticButton from "../MagneticButton";
import type { HeroVariant } from "./config";

/* Scenes load client-side only and on demand, so a visitor to one service
   page never downloads the other five scenes' geometry code. */
const SCENES: Record<HeroVariant, React.ComponentType<{ className?: string }>> = {
  composition: dynamic(() => import("./CompositionScene"), { ssr: false }),
  lattice: dynamic(() => import("./LatticeScene"), { ssr: false }),
  flow: dynamic(() => import("./FlowScene"), { ssr: false }),
  beacon: dynamic(() => import("../ThreeScene"), { ssr: false }),
  swarm: dynamic(() => import("./SwarmScene"), { ssr: false }),
  terrain: dynamic(() => import("./TerrainScene"), { ssr: false }),
};

/** Per-scene CSS stand-in for phones, which never mount WebGL. */
const FALLBACKS: Record<HeroVariant, string> = {
  composition:
    "bg-[radial-gradient(60%_40%_at_72%_38%,rgba(215,251,68,0.10),transparent_70%)]",
  lattice:
    "bg-[radial-gradient(55%_45%_at_75%_40%,rgba(215,251,68,0.11),transparent_72%)]",
  flow: "bg-[radial-gradient(65%_38%_at_68%_45%,rgba(215,251,68,0.09),transparent_70%)]",
  beacon:
    "bg-[radial-gradient(55%_38%_at_70%_38%,rgba(215,251,68,0.09),transparent_72%)]",
  swarm:
    "bg-[radial-gradient(48%_44%_at_74%_38%,rgba(215,251,68,0.12),transparent_68%)]",
  terrain:
    "bg-[radial-gradient(70%_36%_at_70%_52%,rgba(215,251,68,0.10),transparent_72%)]",
};

type Crumb = { label: string; href?: string };

type Stat = { term: string; detail: string };

export default function ServiceHero({
  variant,
  eyebrow,
  headline,
  accentFrom = 0,
  subheadline,
  crumbs,
  stats,
}: {
  variant: HeroVariant;
  eyebrow: string;
  /** Split into lines; each gets its own staggered reveal. */
  headline: string[];
  /** Index from which lines render in the accent colour. */
  accentFrom?: number;
  subheadline: string;
  crumbs: Crumb[];
  stats: Stat[];
}) {
  const ref = useRef<HTMLElement>(null);
  /* Same call the homepage hero makes: a throttled phone spends seconds of
     main thread on a canvas the scrim covers most of anyway. */
  const showScene = useMediaQuery("(min-width: 768px)");
  const Scene = SCENES[variant];

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
          stagger: 0.1,
          // No preloader on inner pages, so the reveal starts almost at once.
          delay: 0.25,
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-label={`${eyebrow} introduction`}
      className="relative mb-20 flex min-h-[86svh] flex-col overflow-hidden md:mb-28"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 md:hidden ${FALLBACKS[variant]}`}
      />
      {showScene && (
        <Scene className="pointer-events-none absolute inset-0 opacity-95" />
      )}

      {/* Legibility scrim over the copy column, then a vignette so the scene
          fades into the edges instead of hitting a hard canvas cut. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/35 via-42% to-transparent to-66%"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(115%_92%_at_66%_42%,transparent_58%,rgba(10,10,11,0.72)_100%)]"
      />
      {/* Bottom fade into the page body below the hero */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pt-36 pb-16 md:px-10 md:pt-44">
        <nav aria-label="Breadcrumb" data-hero-fade>
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            {crumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-paper"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-accent">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <p
          data-hero-fade
          className="mt-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {eyebrow}
        </p>

        <h1 className="mt-6 max-w-[17ch] font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.05] font-medium tracking-tight">
          {headline.map((line, i) => (
            <AnimatedText
              key={line}
              trigger="load"
              delay={0.15 + i * 0.12}
              className={`block${i >= accentFrom ? " text-accent" : ""}`}
            >
              {line}
            </AnimatedText>
          ))}
        </h1>

        <p
          data-hero-fade
          data-speakable
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          {subheadline}
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-3">
          <MagneticButton href="/#audit">
            Get a free audit
            <span aria-hidden>↗</span>
          </MagneticButton>
          <MagneticButton href="/contact" variant="outline">
            Start a project
          </MagneticButton>
        </div>
      </div>

      <div
        data-hero-fade
        className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-10 md:px-10"
      >
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line backdrop-blur-sm md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.term} className="bg-ink/85 px-6 py-7">
              <dt className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                {stat.term}
              </dt>
              <dd className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance">
                {stat.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
