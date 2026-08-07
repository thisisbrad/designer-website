"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/utils";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const num = el.querySelector("[data-count]")!;
    const counter = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
        ScrollTrigger.refresh();
      },
    });

    tl.to(counter, {
      v: 100,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        num.textContent = String(Math.round(counter.v)).padStart(3, "0");
      },
    }).to(el, { yPercent: -100, duration: 0.85, ease: "power4.inOut", delay: 0.15 });

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-[100] flex items-end justify-between bg-ink px-6 pb-6 md:px-10 md:pb-10"
    >
      <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">
        Beltowski® — Portfolio 2026
      </p>
      <p
        data-count
        className="font-display text-7xl font-medium text-paper tabular-nums md:text-8xl"
      >
        000
      </p>
    </div>
  );
}
