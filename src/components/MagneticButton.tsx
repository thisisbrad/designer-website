"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import {
  cn,
  hasFinePointer,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "solid" | "outline";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide select-none transition-colors duration-300";

const variants = {
  solid: "bg-accent text-ink hover:bg-paper",
  outline: "border border-line text-paper hover:border-accent hover:text-accent",
};

export default function MagneticButton({
  children,
  href,
  type = "button",
  variant = "solid",
  className,
  onClick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || prefersReducedMotion() || !hasFinePointer()) return;

    const el = wrap.firstElementChild as HTMLElement;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const cls = cn(base, variants[variant], className);

  return (
    // Slightly oversized hit area gives the magnet room to attract.
    <div ref={wrapRef} className="-m-2 inline-block p-2" data-cursor="hover">
      {href ? (
        <a href={href} onClick={onClick} className={cls}>
          {children}
        </a>
      ) : (
        <button type={type} onClick={onClick} className={cls}>
          {children}
        </button>
      )}
    </div>
  );
}
