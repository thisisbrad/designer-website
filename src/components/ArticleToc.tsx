"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "./SmoothScroll";

export type TocHeading = { id: string; text: string };

/** Distance from the viewport top at which a heading counts as "current" —
 *  clears the fixed navbar so the highlight matches what you're reading. */
const ACTIVE_OFFSET = 160;

/**
 * Sticky table of contents with scroll-spy, plus the article's reading
 * progress bar. Both run off one rAF-throttled scroll listener, and offsets
 * are measured fresh each tick so lazy images and font swaps can't desync it.
 */
export default function ArticleToc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headings.length) return;
    let frame = 0;

    const update = () => {
      frame = 0;

      const article = document.querySelector<HTMLElement>("[data-article]");
      if (article && barRef.current) {
        const { top, height } = article.getBoundingClientRect();
        const scrollable = height - window.innerHeight;
        const progress =
          scrollable > 0 ? Math.min(1, Math.max(0, -top / scrollable)) : 0;
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      // The current section is the last heading to have crossed the offset.
      let current = headings[0].id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) {
          current = heading.id;
        }
      }

      // Near the bottom the last section may never reach the offset, so
      // claim it once the page is effectively scrolled out.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 120;
      if (atBottom) current = headings[headings.length - 1].id;

      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActive(id);
    scrollToSection(`#${id}`, -110);
  };

  return (
    <>
      {/* Reading progress — decorative, the article is fully usable without it */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
      >
        <div
          ref={barRef}
          data-reading-progress
          className="h-full origin-left scale-x-0 bg-accent will-change-transform"
        />
      </div>

      <nav aria-labelledby="toc-heading">
        <h2
          id="toc-heading"
          className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
        >
          Contents
        </h2>
        <ol className="mt-5 flex flex-col gap-3 border-l border-line pl-4">
          {headings.map((heading) => {
            const isActive = heading.id === active;
            return (
              <li key={heading.id} className="relative">
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute top-0 -left-4 h-full w-px bg-accent"
                  />
                )}
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => go(e, heading.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "block text-sm leading-snug transition-colors duration-300",
                    isActive ? "text-accent" : "text-muted hover:text-content"
                  )}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
