"use client";

import { useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/utils";

type Props = {
  children: string;
  as?: ElementType;
  id?: string;
  className?: string;
  delay?: number;
  /** "load" plays after `delay`; "scroll" waits until the element enters the viewport. */
  trigger?: "load" | "scroll";
};

export default function AnimatedText({
  children,
  as: Tag = "span",
  id,
  className,
  delay = 0,
  trigger = "scroll",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = children.split(" ");

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-word]");

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        targets,
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.045,
          delay,
          ...(trigger === "scroll"
            ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
            : {}),
        }
      );
    });
    return () => mm.revert();
  }, [delay, trigger]);

  // Cast the polymorphic tag to a concrete element so TS can type its props;
  // all tags used here (span, h1–h3, p) accept the same subset.
  const Component = Tag as "span";

  return (
    <Component
      ref={ref as React.Ref<HTMLSpanElement>}
      id={id}
      className={className}
      aria-label={children}
    >
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span data-word className="inline-block will-change-transform">
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Component>
  );
}
