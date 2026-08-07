"use client";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import { useSectionReveal, useParallax } from "@/hooks/useGSAPAnimations";
import AnimatedText from "./AnimatedText";
import MagneticButton from "./MagneticButton";

const stats = [
  { value: 9, suffix: "", label: "Years of practice" },
  { value: 100, suffix: "%", label: "Of the work done by me" },
  { value: 48, suffix: "h", label: "Max reply time" },
  { value: 24, suffix: "/7", label: "AI assistant coverage" },
];

export default function About() {
  const revealRef = useSectionReveal<HTMLElement>();
  const parallaxRef = useParallax<HTMLDivElement>(8);

  useIsomorphicLayoutEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>("[data-counter]").forEach((node) => {
        const target = Number(node.dataset.target);
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
          onUpdate: () => {
            node.textContent = String(Math.round(counter.v)).padStart(2, "0");
          },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="about"
      ref={revealRef}
      aria-labelledby="about-heading"
      className="relative overflow-hidden"
    >
      {/* Ambient glow mirrored from the hero, anchored to the portrait side */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] -left-[15%] h-[55vh] w-[55vw] rounded-full bg-accent/[0.05] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          02 — About
        </p>

        <h2
          id="about-heading"
          className="mb-14 max-w-[18ch] font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.08] font-medium tracking-tight md:mb-20"
        >
          <AnimatedText className="block">Design-minded developer.</AnimatedText>
          <AnimatedText className="block text-accent">
            Growth-minded partner.
          </AnimatedText>
        </h2>

        <div className="grid gap-12 lg:grid-cols-12">
          <div ref={parallaxRef} className="lg:col-span-5" data-reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
              <div
                data-parallax
                className="absolute -inset-y-[12%] inset-x-0 bg-gradient-to-br from-ink-2 to-[#16190f]"
              >
                <div
                  aria-hidden
                  className="absolute top-1/2 left-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[140px]"
                />
                <span
                  aria-hidden
                  className="absolute bottom-[-4%] left-[6%] font-display text-[12rem] leading-none font-semibold text-paper/[0.07] select-none md:text-[16rem]"
                >
                  B.
                </span>
              </div>
              <p className="absolute bottom-5 left-5 font-mono text-[11px] tracking-[0.25em] text-paper/50 uppercase">
                Studio portrait — Warsaw, 2026
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-lg leading-relaxed text-muted lg:col-span-6 lg:col-start-7">
            <p data-reveal>
              I&apos;m <span className="text-paper">Brad Beltowski</span> — an
              independent designer and developer with nine years of practice
              building websites that don&apos;t just look premium, they perform.
              I&apos;ve worked with startups, agencies and local businesses,
              usually as the person who takes an idea from first sketch to the
              first page of Google.
            </p>
            <p data-reveal>
              My work sits where design, engineering and search meet: fast,
              accessible sites with honest hierarchy, technical SEO baked into
              the architecture instead of bolted on, and AI assistants and
              automations that actually ship to production — not demos that die
              in a slide deck.
            </p>
            <p data-reveal>
              Beyond client work I run a steady practice of experiments — AI
              agents, SEO tooling, interaction studies — that keeps the
              commercial work ahead of the curve. The lab feeds the studio; the
              studio funds the lab.
            </p>

            <div data-reveal className="mt-4 flex flex-wrap items-center gap-6">
              <MagneticButton
                variant="outline"
                href="mailto:hello@beltowski.studio?subject=Intro%20call"
              >
                Book a free intro call
                <span aria-hidden>↗</span>
              </MagneticButton>
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                20 minutes · No pitch deck
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[10%] -top-1/2 h-full rounded-full bg-accent/[0.04] blur-[120px]"
          />
          <dl className="relative grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} data-reveal className="flex flex-col-reverse bg-ink p-8">
                <dt className="mt-3 font-mono text-xs tracking-[0.2em] text-muted uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-5xl font-medium tracking-tight md:text-6xl">
                  <span data-counter data-target={stat.value}>
                    {String(stat.value).padStart(2, "0")}
                  </span>
                  <span className="text-accent">{stat.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
