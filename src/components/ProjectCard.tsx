"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn, hasFinePointer, prefersReducedMotion } from "@/lib/utils";
import type { Project } from "@/data/projects";

export default function ProjectCard({
  project,
  flip = false,
}: {
  project: Project;
  flip?: boolean;
}) {
  const visualRef = useRef<HTMLDivElement>(null);

  const hover = (scale: number) => () => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    gsap.to(visualRef.current, { scale, duration: 0.8, ease: "power3.out" });
  };

  return (
    <article
      data-card
      aria-label={project.title}
      className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
    >
      <div className={cn("lg:col-span-7", flip && "lg:order-2")}>
        <div
          className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-line"
          data-cursor="hover"
          onMouseEnter={hover(1.05)}
          onMouseLeave={hover(1)}
        >
          {/* Parallax layer bleeds vertically so the scrubbed drift never shows edges */}
          <div data-parallax className="absolute inset-x-0 -inset-y-[12%]">
            <div
              ref={visualRef}
              className="absolute inset-0 will-change-transform"
              style={{
                background: `linear-gradient(135deg, ${project.palette.from}, ${project.palette.to})`,
              }}
            >
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 size-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
                style={{ background: project.palette.glow }}
              />
              <span
                aria-hidden
                className="absolute right-[6%] bottom-[2%] font-display text-[24vw] leading-none font-semibold text-paper/[0.06] select-none lg:text-[13vw]"
              >
                {project.index}
              </span>
              <span className="absolute top-[16%] left-[8%] font-mono text-[11px] tracking-[0.3em] text-paper/40 uppercase">
                {project.slug}.case
              </span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100">
            <span className="rounded-full border border-paper/30 px-5 py-2 font-mono text-xs tracking-[0.2em] uppercase">
              View case study
            </span>
          </div>
        </div>
      </div>

      <div className={cn("lg:col-span-5", flip && "lg:order-1")}>
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {project.index} — {project.category} · {project.year}
        </p>

        <h3 className="mt-4 font-display text-3xl font-medium tracking-tight md:text-4xl">
          {project.title}
        </h3>

        <p className="mt-4 max-w-xl leading-relaxed text-muted">{project.summary}</p>

        <div className="mt-8 flex items-baseline gap-4 border-t border-line pt-6">
          <p className="font-display text-5xl font-medium tracking-tight text-accent">
            {project.metric.value}
          </p>
          <p className="max-w-[18ch] font-mono text-[11px] leading-relaxed tracking-[0.15em] text-muted uppercase">
            {project.metric.label}
          </p>
        </div>

        <ul className="mt-6 flex flex-wrap items-center gap-2" aria-label="Project tags">
          <li className="rounded-full bg-accent/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-accent uppercase">
            {project.role}
          </li>
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-muted uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
