"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/utils";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFinePointer() && !prefersReducedMotion()) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const ringInner = ringInnerRef.current!;
    document.documentElement.classList.add("cursor-none");

    gsap.set([dot, ring], { x: -100, y: -100 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const interactive = (e.target as HTMLElement).closest(
        "a, button, input, textarea, select, label, [data-cursor='hover']"
      );
      gsap.to(ringInner, {
        scale: interactive ? 1.8 : 1,
        opacity: interactive ? 0.9 : 0.45,
        duration: 0.35,
        ease: "power3.out",
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("cursor-none");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    /* Topmost layer on the page, above every overlay.
     *
     * This sat at z-90, which was fine until anything else claimed 90+ — the
     * assistant panel (95), the consent banner and preloader (100), the skip
     * link (110). The cursor then rendered *behind* them, so moving onto the
     * chat made the pointer vanish. A cursor is never occluded by content, and
     * `pointer-events-none` means sitting on top costs nothing: it cannot
     * intercept a click. Keep this the highest number in the codebase. */
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={dotRef} className="absolute top-0 left-0">
        <div className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>
      <div ref={ringRef} className="absolute top-0 left-0">
        <div
          ref={ringInnerRef}
          className="size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/50 opacity-45"
        />
      </div>
    </div>
  );
}
