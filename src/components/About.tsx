"use client";

import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import { useSectionReveal, useParallax } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";

const stats = [
  { value: 9, suffix: "", label: "Years of practice" },
  { value: 72, suffix: "+", label: "Projects shipped" },
  { value: 214, suffix: "%", label: "Avg. organic traffic lift" },
  { value: 26, suffix: "", label: "AI solutions launched" },
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
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading
        id="about-heading"
        eyebrow="02 — About"
        title="Design-minded developer. Growth-minded partner."
      />

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
            I&apos;m <span className="text-paper">Bart Beltowski</span> — an
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
        </div>
      </div>

      <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
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
    </section>
  );
}
