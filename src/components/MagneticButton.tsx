"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { trackCta } from "@/lib/analytics/events";
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
  /**
   * Where this button sits, for the `cta_click` event. Left unset, the nearest
   * ancestor `section[id]` is used — which is right often enough that only
   * buttons outside a section need to name themselves.
   */
  analyticsLocation?: string;
  /** Skip CTA tracking entirely, for buttons that aren't conversion steps. */
  analyticsExclude?: boolean;
};

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide select-none transition-colors duration-300";

const variants = {
  /* accent-fill, not accent: the brand lime stays lime in both themes.
     The readable-on-light accent is for text and borders. */
  solid:
    "bg-accent-fill text-on-accent hover:bg-content hover:text-surface",
  outline: "border border-line text-content hover:border-accent hover:text-accent",
};

export default function MagneticButton({
  children,
  href,
  type = "button",
  variant = "solid",
  className,
  onClick,
  analyticsLocation,
  analyticsExclude = false,
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

  /**
   * Every CTA on the site routes through this component, so measuring here
   * instruments all of them at once — no call site has to remember to.
   *
   * Submit buttons are excluded: the form funnel (`form_start` →
   * `generate_lead` / `form_error`) already describes them, and counting a
   * rejected submit as a CTA click would inflate the numbers that matter most.
   */
  const handleClick = (e: React.MouseEvent) => {
    if (!analyticsExclude && type !== "submit") {
      const el = e.currentTarget as HTMLElement;
      // Read the label from the DOM rather than the children prop, which may
      // be an arbitrary node tree. The trailing arrow glyph is decoration.
      const label = (el.textContent ?? "").replace(/[↗→↑\s]+$/u, "").trim();

      trackCta({
        label: label || "(unlabelled)",
        location:
          analyticsLocation ?? el.closest("section[id]")?.id ?? "page",
        destination: href,
      });
    }

    onClick?.(e);
  };

  return (
    // Slightly oversized hit area gives the magnet room to attract.
    <div ref={wrapRef} className="-m-2 inline-block p-2" data-cursor="hover">
      {href ? (
        <a href={href} onClick={handleClick} className={cls}>
          {children}
        </a>
      ) : (
        <button type={type} onClick={handleClick} className={cls}>
          {children}
        </button>
      )}
    </div>
  );
}
