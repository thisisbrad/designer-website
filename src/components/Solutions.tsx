"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";
import { solutions } from "@/data/solutions";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import AnimatedText from "./AnimatedText";
import MagneticButton from "./MagneticButton";

const dotGrid: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(rgba(242,239,232,0.12) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  maskImage:
    "radial-gradient(ellipse 90% 70% at 50% 25%, black, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 90% 70% at 50% 25%, black, transparent 75%)",
};

const auditChecks = [
  "Search visibility & keyword gaps",
  "Speed & Core Web Vitals",
  "Conversion blockers & quick wins",
  "Where AI could save you hours",
];

const inputCls =
  "w-full border-b border-paper/15 bg-transparent py-3 text-base text-content transition-colors placeholder:text-muted/40 focus:border-accent focus:outline-none";

const labelCls =
  "mb-2 block font-mono text-[11px] tracking-[0.2em] text-muted uppercase";

type FormStatus = "idle" | "sending" | "sent" | "error";

export default function Solutions() {
  const ref = useSectionReveal<HTMLElement>();
  const bandRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");

  // One-shot entrance for copy and form; scroll-scrubbed parallax for the
  // portrait and glow, so the scene has depth while the section stays compact.
  useIsomorphicLayoutEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: band, start: "top 70%", once: true },
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(
        band.querySelectorAll("[data-band-copy] > *"),
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
        0
      ).fromTo(
        band.querySelector("[data-band-form]"),
        { x: 48, opacity: 0 },
        { x: 0, opacity: 1, duration: 1 },
        0.2
      );

      // The portrait starts sunk below the band's bottom edge (clipped by
      // overflow-hidden) and rises flush as you scroll — no gap ever shows.
      gsap.fromTo(
        band.querySelector("[data-band-portrait]"),
        { yPercent: 18 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: band,
            start: "top 90%",
            end: "center 60%",
            scrub: 0.6,
          },
        }
      );

      gsap.fromTo(
        band.querySelector("[data-band-glow]"),
        { opacity: 0.35 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: band,
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    try {
      const res = await fetch("/api/audit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch (err) {
      console.error("Lead submit failed:", err);
      setStatus("error");
    }
  };

  return (
    <section
      id="solutions"
      ref={ref}
      aria-labelledby="solutions-heading"
      className="relative overflow-hidden"
    >
      {/* Ambient backdrop — echoes the hero without a second WebGL canvas */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[15%] left-1/2 h-[60vh] w-[85vw] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[160px]" />
        <div
          className="absolute inset-0 opacity-30 motion-safe:animate-drift"
          style={dotGrid}
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 pt-28 md:px-10 md:pt-40">
        <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          01 — The plan
        </p>

        <h2
          id="solutions-heading"
          className="max-w-[16ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] font-medium tracking-tight"
        >
          <AnimatedText className="block">A straight line from</AnimatedText>
          <AnimatedText className="block text-accent">
            search to sale.
          </AnimatedText>
        </h2>

        <p
          data-reveal
          className="mt-7 max-w-xl text-base leading-relaxed text-muted md:text-lg"
        >
          No retainers for vague brand awareness. One plan with three moving
          parts — each one measurable, each one built to compound.
        </p>

        <div className="mt-16 grid gap-4 md:mt-20 lg:grid-cols-3">
          {solutions.map((solution) => (
            <article
              key={solution.index}
              data-reveal
              aria-label={solution.phase}
            >
              <div
                data-cursor="hover"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-2/80 p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40"
              >
                <div
                  aria-hidden
                  className="absolute -top-[30%] -right-[20%] size-[75%] rounded-full bg-accent/10 opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="absolute -top-7 right-3 font-display text-[8rem] leading-none font-semibold text-content/[0.04] select-none transition-colors duration-700 group-hover:text-accent/10"
                >
                  {solution.index}
                </span>

                <p className="relative flex items-baseline justify-between font-mono text-xs tracking-[0.25em] uppercase">
                  <span className="text-muted">Phase {solution.index}</span>
                  <span className="text-accent">{solution.phase}</span>
                </p>

                <h3 className="relative mt-6 font-display text-3xl font-medium tracking-tight">
                  {solution.title}
                </h3>

                <p className="relative mt-4 leading-relaxed text-muted">
                  {solution.description}
                </p>

                <ul
                  className="relative mt-8 flex flex-col border-t border-line"
                  aria-label={`${solution.phase} deliverables`}
                >
                  {solution.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 border-b border-line py-3 text-sm text-content/80"
                    >
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="relative mt-auto pt-8 font-mono text-[11px] leading-relaxed tracking-[0.2em] text-muted uppercase">
                  {solution.outcome}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full-bleed lead capture band — the conversion moment of the page.
          The tint rises out of the page color so there is no hard seam with
          the cards above, and the glow is clipped so it can't wash upward. */}
      <div
        id="audit"
        ref={bandRef}
        className="relative mt-16 scroll-mt-16 overflow-hidden border-b border-accent/10 md:mt-20"
      >
        {/* Focus treatment: rising tint, breathing glow and an edge vignette
            that pulls the eye to the center while the band owns the viewport */}
        <div aria-hidden data-band-glow className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.08] to-surface-2" />
          <div className="absolute top-[15%] left-1/4 h-[75%] w-1/2 rounded-full bg-accent/10 blur-[160px] motion-safe:animate-glow-breathe" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 45%, rgba(5,5,4,0.5) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-14 xl:grid-cols-[1fr_auto_1fr]">
          <div data-band-copy>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-accent uppercase">
              <span
                aria-hidden
                className="size-1.5 animate-pulse-dot rounded-full bg-accent"
              />
              Free — no strings attached
            </p>

            <AnimatedText
              as="p"
              className="font-display text-3xl leading-[1.1] font-medium tracking-tight text-balance md:text-4xl"
            >
              Get a free 15-point audit of your website.
            </AnimatedText>

            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              I&apos;ll record a short video walking through exactly what&apos;s
              holding your site back — and what I&apos;d fix first. Yours to
              keep, whoever you build with.
            </p>

            <ul
              className="mt-8 flex flex-col gap-3"
              aria-label="What the audit covers"
            >
              {auditChecks.map((item) => (
                <li key={item} className="flex items-center gap-3 text-content/85">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-4">
              <div className="relative size-14 shrink-0">
                <div className="absolute inset-0 overflow-hidden rounded-full border border-accent/30 bg-gradient-to-br from-[#242c1a] to-surface-2">
                  <Image
                    src="/portrait-face.png"
                    alt=""
                    width={56}
                    height={56}
                    className="size-full object-cover"
                  />
                </div>
                <span
                  aria-hidden
                  className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-surface bg-accent motion-safe:animate-pulse-dot"
                />
              </div>
              <div>
                <p className="font-display text-base font-medium">
                  Brad Beltowski
                </p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed tracking-[0.15em] text-muted uppercase">
                  Every audit recorded personally — never an automated report
                </p>
              </div>
            </div>

            <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              48h turnaround · No sales call · Video walkthrough
            </p>
          </div>

          {/* Duotone owner portrait, centered between copy and form and
              anchored to the band's bottom edge (the negative margin cancels
              the container's bottom padding). */}
          <div
            data-band-portrait
            className="relative hidden self-end justify-self-center will-change-transform xl:block xl:-mb-24"
          >
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 h-[90%] w-[120%] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
            />

            {/* Subtle particles orbiting the portrait */}
            <div aria-hidden className="absolute inset-0">
              <span className="absolute top-[8%] left-[6%] size-1.5 rounded-full bg-accent/80 motion-safe:animate-float-y" />
              <span
                className="absolute top-[24%] right-[2%] size-1 rounded-full bg-content/60 motion-safe:animate-float-y"
                style={{ animationDelay: "-2.2s", animationDuration: "7s" }}
              />
              <span
                className="absolute top-[55%] left-[-4%] size-2.5 rounded-full bg-accent/40 blur-[2px] motion-safe:animate-float-y"
                style={{ animationDelay: "-4s", animationDuration: "8s" }}
              />
              <span className="absolute top-[12%] right-[14%] size-6 rounded-full border border-dashed border-accent/40 motion-safe:animate-rotate-slow" />
              <span
                className="absolute right-[-5%] bottom-[18%] size-1.5 rounded-full bg-accent/60 motion-safe:animate-float-y"
                style={{ animationDelay: "-1.4s" }}
              />
            </div>

            <Image
              src="/portrait-duotone.png"
              alt="Brad Beltowski"
              width={512}
              height={512}
              priority={false}
              className="relative w-[480px] select-none 2xl:w-[560px]"
            />
          </div>

          <form
            aria-label="Request your free website audit"
            data-band-form
            className="rounded-2xl border border-accent/20 bg-surface/70 p-8 shadow-[0_0_90px_rgba(215,251,68,0.07)] backdrop-blur-md md:p-10"
            onSubmit={submitLead}
          >
            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <label htmlFor="audit-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="audit-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Appleseed"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="audit-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="audit-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jane@business.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-7">
              <label htmlFor="audit-url" className={labelCls}>
                Your website
              </label>
              <input
                id="audit-url"
                name="website"
                type="url"
                required
                inputMode="url"
                autoComplete="url"
                placeholder="https://yourbusiness.com"
                className={inputCls}
              />
            </div>

            <div className="mt-7">
              <label htmlFor="audit-goal" className={labelCls}>
                Biggest goal right now
              </label>
              <select id="audit-goal" name="goal" className={inputCls}>
                <option className="bg-surface">More traffic from search</option>
                <option className="bg-surface">More enquiries & sales</option>
                <option className="bg-surface">Automate work with AI</option>
                <option className="bg-surface">All of the above</option>
              </select>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <MagneticButton type="submit">
                {status === "sending" ? "Sending…" : "Get my free audit"}
                <span aria-hidden>↗</span>
              </MagneticButton>
              {status === "sent" && (
                <p role="status" className="text-sm text-accent">
                  Thanks — your audit lands in your inbox within 48 hours.
                </p>
              )}
              {status === "error" && (
                <p role="status" className="text-sm text-[#ffb36b]">
                  Something went wrong — email me instead at
                  hello@beltowski.studio.
                </p>
              )}
            </div>

            <p className="mt-6 font-mono text-[10px] tracking-[0.15em] text-muted/70 uppercase">
              No spam, no list — just the audit. See the{" "}
              <Link
                href="/privacy"
                className="underline decoration-muted/40 underline-offset-4 transition-colors hover:text-accent"
              >
                privacy policy
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
