"use client";

import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";

type Experiment = {
  title: string;
  type: string;
  year: string;
  visual: "orbit" | "marquee" | "dots" | "eq" | "bloom" | "cross";
};

const experiments: Experiment[] = [
  { title: "RankLens", type: "SEO audit engine", year: "2026", visual: "orbit" },
  { title: "Query Stream", type: "Live search ticker", year: "2025", visual: "marquee" },
  { title: "Entity Graph", type: "Knowledge-graph viz", year: "2025", visual: "dots" },
  { title: "Voicebox", type: "AI voice agent", year: "2024", visual: "eq" },
  { title: "Embedding Bloom", type: "Vector-space visual", year: "2024", visual: "bloom" },
  { title: "Heat Grid", type: "CRO heatmap prototype", year: "2023", visual: "cross" },
];

function Visual({ kind }: { kind: Experiment["visual"] }) {
  switch (kind) {
    case "orbit":
      return (
        <div className="relative flex size-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-accent/50 motion-safe:animate-rotate-slow" />
          <div className="absolute inset-4 rounded-full border border-paper/15" />
          <div className="size-2 rounded-full bg-accent" />
        </div>
      );
    case "marquee":
      return (
        <div className="w-full overflow-hidden">
          <div className="flex w-max whitespace-nowrap font-display text-4xl font-semibold tracking-tight text-paper/20 motion-safe:animate-marquee">
            <span className="pr-6">SEARCH — RANK — CONVERT —&nbsp;</span>
            <span className="pr-6">SEARCH — RANK — CONVERT —&nbsp;</span>
          </div>
        </div>
      );
    case "dots":
      return (
        <div
          className="size-full motion-safe:animate-drift"
          style={{
            backgroundImage:
              "radial-gradient(rgba(242,239,232,0.25) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      );
    case "eq":
      return (
        <div className="flex h-24 items-end gap-2">
          {[0.9, 0.5, 1, 0.35, 0.7].map((delay, i) => (
            <div
              key={i}
              className="w-2.5 origin-bottom rounded-t-sm bg-accent/70 motion-safe:animate-eq"
              style={{ height: "100%", animationDelay: `${delay * -1}s` }}
            />
          ))}
        </div>
      );
    case "bloom":
      return (
        <div
          className="size-32 rounded-full opacity-70 blur-2xl motion-safe:animate-rotate-slow"
          style={{
            background:
              "conic-gradient(from 0deg, #d7fb44, #7db8ff, #b49bff, #d7fb44)",
          }}
        />
      );
    case "cross":
      return (
        <div className="relative size-28">
          <div className="absolute top-1/2 left-0 h-px w-full bg-paper/20" />
          <div className="absolute top-0 left-1/2 h-full w-px bg-paper/20" />
          <div className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent motion-safe:animate-pulse-dot" />
        </div>
      );
  }
}

export default function Experiments() {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      id="experiments"
      ref={ref}
      aria-labelledby="experiments-heading"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading
        id="experiments-heading"
        eyebrow="05 — Lab"
        title="Selected experiments"
        description="AI agents, SEO tooling and interface prototypes — the playground that keeps client work ahead of the curve."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((exp) => (
          <li key={exp.title} data-reveal data-cursor="hover">
            <div className="group flex aspect-square flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-colors duration-500 hover:border-accent/40">
              <div className="flex flex-1 items-center justify-center overflow-hidden p-8 transition-transform duration-700 group-hover:scale-105">
                <Visual kind={exp.visual} />
              </div>
              <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
                <h3 className="font-display text-lg font-medium tracking-tight">
                  {exp.title}
                </h3>
                <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                  {exp.type} · {exp.year}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
